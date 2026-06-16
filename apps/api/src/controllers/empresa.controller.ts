import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAuthToken } from '../utils/jwt'
import { isValidCnpj, sanitizeCnpj } from '../utils/cnpj'

const SALT_ROUNDS = 10

const ESTAGIARIO_SEGURO = {
  id_estagiario: true,
  estagiario_nome_completo: true,
  estagiario_email: true,
  estagiario_curso: true,
  estagiario_instituicao: true,
  estagiario_cidade: true,
  estagiario_estado: true,
} as const

function publicEmpresa(empresa: { id_empresa: number; empresa_nome: string; empresa_cnpj: string }) {
  return {
    id: empresa.id_empresa,
    nome: empresa.empresa_nome,
    cnpj: empresa.empresa_cnpj,
  }
}

export const EmpresaController = {
  // ─── Cadastro ───────────────────────────────────────────────────────────────

  cadastrar: async (req: Request, res: Response) => {
    try {
      const { nomeEmpresa, cnpj, email, senha, setor, cidade, descricao } = req.body as {
        nomeEmpresa?: string
        cnpj?: string
        email?: string
        senha?: string
        setor?: string
        cidade?: string
        descricao?: string
      }

      if (!nomeEmpresa || !cnpj || !email || !senha) {
        return res.status(400).json({ error: 'Informe nome da empresa, CNPJ, e-mail e senha.' })
      }

      if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' })
      }

      if (!isValidCnpj(cnpj)) {
        return res.status(400).json({ error: 'CNPJ inválido. Informe os 14 dígitos de um CNPJ válido.' })
      }

      const cnpjDigitos = sanitizeCnpj(cnpj)
      const emailNormalizado = email.trim().toLowerCase()

      const [empresaExistente, usuarioExistente] = await Promise.all([
        prisma.empresa.findUnique({ where: { empresa_cnpj: cnpjDigitos } }),
        prisma.usuario.findUnique({ where: { usuario_email: emailNormalizado } }),
      ])

      if (empresaExistente) {
        return res.status(409).json({ error: 'Já existe uma empresa cadastrada com este CNPJ.' })
      }

      if (usuarioExistente) {
        return res.status(409).json({ error: 'Já existe uma conta cadastrada com este e-mail.' })
      }

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS)

      const { usuario, empresa } = await prisma.$transaction(async (tx) => {
        const empresa = await tx.empresa.create({
          data: {
            empresa_cnpj: cnpjDigitos,
            empresa_nome: nomeEmpresa.trim(),
            empresa_setor: setor?.trim() || null,
            empresa_cidade: cidade?.trim() || null,
            empresa_descricao: descricao?.trim() || null,
          },
        })

        const usuario = await tx.usuario.create({
          data: {
            usuario_nome: nomeEmpresa.trim(),
            usuario_email: emailNormalizado,
            usuario_senha: senhaHash,
            id_empresa_empresa: empresa.id_empresa,
          },
        })

        return { usuario, empresa }
      })

      const token = signAuthToken({
        id_usuario: usuario.id_usuario,
        role: 'empresa',
        id_empresa: empresa.id_empresa,
      })

      return res.status(201).json({ token, role: 'empresa', empresa: publicEmpresa(empresa) })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao cadastrar empresa.' })
    }
  },

  // ─── Listagem geral ──────────────────────────────────────────────────────────

  listar: async (_req: Request, res: Response) => {
    try {
      const empresas = await prisma.empresa.findMany({ orderBy: { id_empresa: 'asc' } })
      return res.json(empresas)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar empresas.' })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const empresa = await prisma.empresa.findUnique({ where: { id_empresa: id } })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      return res.json(empresa)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao buscar empresa.' })
    }
  },

  // ─── Perfil ──────────────────────────────────────────────────────────────────

  verPerfil: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const empresa = await prisma.empresa.findUnique({ where: { id_empresa: id } })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      return res.json(empresa)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao buscar perfil da empresa.' })
    }
  },

  atualizarPerfil: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const { nomeEmpresa, cnpj, setor, cidade, descricao } = req.body as {
        nomeEmpresa?: string
        cnpj?: string
        setor?: string
        cidade?: string
        descricao?: string
      }

      const empresaAtual = await prisma.empresa.findUnique({ where: { id_empresa: id } })
      if (!empresaAtual) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      let cnpjDigitos: string | undefined
      if (cnpj !== undefined) {
        if (!isValidCnpj(cnpj)) {
          return res.status(400).json({ error: 'CNPJ inválido. Informe os 14 dígitos de um CNPJ válido.' })
        }
        cnpjDigitos = sanitizeCnpj(cnpj)

        const cnpjEmUso = await prisma.empresa.findUnique({ where: { empresa_cnpj: cnpjDigitos } })
        if (cnpjEmUso && cnpjEmUso.id_empresa !== id) {
          return res.status(409).json({ error: 'Já existe uma empresa cadastrada com este CNPJ.' })
        }
      }

      const empresa = await prisma.empresa.update({
        where: { id_empresa: id },
        data: {
          empresa_nome: nomeEmpresa?.trim() ?? undefined,
          empresa_cnpj: cnpjDigitos,
          empresa_setor: setor !== undefined ? setor.trim() || null : undefined,
          empresa_cidade: cidade !== undefined ? cidade.trim() || null : undefined,
          empresa_descricao: descricao !== undefined ? descricao.trim() || null : undefined,
        },
      })

      return res.json(empresa)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar perfil da empresa.' })
    }
  },

  // ─── Minhas Vagas ────────────────────────────────────────────────────────────

  listarVagas: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)

      const empresa = await prisma.empresa.findUnique({ where: { id_empresa: id } })
      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      const vagas = await prisma.vaga.findMany({
        where: { id_empresa_empresa: id },
        orderBy: { id_vaga: 'desc' },
      })

      return res.json(vagas)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar vagas da empresa.' })
    }
  },

  // ─── Candidatos ──────────────────────────────────────────────────────────────

  listarCandidatos: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)

      const empresa = await prisma.empresa.findUnique({ where: { id_empresa: id } })
      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      const vagas = await prisma.vaga.findMany({
        where: { id_empresa_empresa: id },
        select: { id_vaga: true },
      })

      const vagaIds = vagas.map((v) => v.id_vaga)

      const candidatos = await prisma.match.findMany({
        where: { id_vaga_vagas: { in: vagaIds } },
        orderBy: { match_data: 'desc' },
        include: {
          estagiario: { select: ESTAGIARIO_SEGURO },
          vaga: true,
        },
      })

      return res.json(candidatos)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar candidatos.' })
    }
  },

  // ─── Atualizar / Deletar (legado) ────────────────────────────────────────────

  atualizar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const { nomeEmpresa, cnpj, setor, cidade, descricao } = req.body as {
        nomeEmpresa?: string
        cnpj?: string
        setor?: string
        cidade?: string
        descricao?: string
      }

      const empresaAtual = await prisma.empresa.findUnique({ where: { id_empresa: id } })
      if (!empresaAtual) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      let cnpjDigitos: string | undefined
      if (cnpj !== undefined) {
        if (!isValidCnpj(cnpj)) {
          return res.status(400).json({ error: 'CNPJ inválido. Informe os 14 dígitos de um CNPJ válido.' })
        }
        cnpjDigitos = sanitizeCnpj(cnpj)

        const cnpjEmUso = await prisma.empresa.findUnique({ where: { empresa_cnpj: cnpjDigitos } })
        if (cnpjEmUso && cnpjEmUso.id_empresa !== id) {
          return res.status(409).json({ error: 'Já existe uma empresa cadastrada com este CNPJ.' })
        }
      }

      const empresa = await prisma.empresa.update({
        where: { id_empresa: id },
        data: {
          empresa_nome: nomeEmpresa?.trim() ?? undefined,
          empresa_cnpj: cnpjDigitos,
          empresa_setor: setor !== undefined ? setor.trim() || null : undefined,
          empresa_cidade: cidade !== undefined ? cidade.trim() || null : undefined,
          empresa_descricao: descricao !== undefined ? descricao.trim() || null : undefined,
        },
      })

      return res.json(empresa)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar empresa.' })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const empresa = await prisma.empresa.findUnique({ where: { id_empresa: id } })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      await prisma.empresa.delete({ where: { id_empresa: id } })
      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover empresa.' })
    }
  },
}
