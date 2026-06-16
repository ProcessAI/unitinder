import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAuthToken } from '../utils/jwt'
import { isValidCnpj, sanitizeCnpj } from '../utils/cnpj'

const SALT_ROUNDS = 10

function publicEstagiario(estagiario: { id_estagiario: number; estagiario_nome_completo: string; estagiario_email: string }) {
  return {
    id: estagiario.id_estagiario,
    nome: estagiario.estagiario_nome_completo,
    email: estagiario.estagiario_email,
  }
}

function publicEmpresa(empresa: { id_empresa: number; empresa_nome: string; empresa_cnpj: string }) {
  return {
    id: empresa.id_empresa,
    nome: empresa.empresa_nome,
    cnpj: empresa.empresa_cnpj,
  }
}

export const AuthController = {
  login: async (req: Request, res: Response) => {
    try {
      const { identificador, senha } = req.body as { identificador?: string; senha?: string }

      if (!identificador || !senha) {
        return res.status(400).json({ error: 'Informe identificador (e-mail ou CNPJ) e senha.' })
      }

      const apenasDigitos = sanitizeCnpj(identificador)
      const pareceCnpj = apenasDigitos.length === 14

      if (pareceCnpj) {
        const empresa = await prisma.empresa.findUnique({ where: { empresa_cnpj: apenasDigitos } })

        if (!empresa) {
          return res.status(401).json({ error: 'CNPJ ou senha inválidos.' })
        }

        const usuario = await prisma.usuario.findFirst({ where: { id_empresa_empresa: empresa.id_empresa } })

        if (!usuario) {
          return res.status(401).json({ error: 'CNPJ ou senha inválidos.' })
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.usuario_senha)
        if (!senhaCorreta) {
          return res.status(401).json({ error: 'CNPJ ou senha inválidos.' })
        }

        const token = signAuthToken({
          id_usuario: usuario.id_usuario,
          role: 'empresa',
          id_empresa: empresa.id_empresa,
        })

        return res.json({ token, role: 'empresa', empresa: publicEmpresa(empresa) })
      }

      const usuario = await prisma.usuario.findUnique({
        where: { usuario_email: identificador.trim().toLowerCase() },
      })

      if (!usuario || !usuario.id_estagiario_estagiario) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.usuario_senha)
      if (!senhaCorreta) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
      }

      const estagiario = await prisma.estagiario.findUnique({
        where: { id_estagiario: usuario.id_estagiario_estagiario },
      })

      if (!estagiario) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
      }

      const token = signAuthToken({
        id_usuario: usuario.id_usuario,
        role: 'estagiario',
        id_estagiario: estagiario.id_estagiario,
      })

      return res.json({ token, role: 'estagiario', estagiario: publicEstagiario(estagiario) })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao realizar login.' })
    }
  },

  registroUsuario: async (req: Request, res: Response) => {
    try {
      const { nome, email, senha, cpf } = req.body as {
        nome?: string
        email?: string
        senha?: string
        cpf?: string
      }

      if (!nome || !email || !senha || !cpf) {
        return res.status(400).json({ error: 'Informe nome, email, senha e cpf.' })
      }

      if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' })
      }

      const emailNormalizado = email.trim().toLowerCase()
      const cpfDigitos = cpf.replace(/\D/g, '')

      if (cpfDigitos.length !== 11) {
        return res.status(400).json({ error: 'CPF inválido. Informe os 11 dígitos.' })
      }

      const [usuarioExistente, estagiarioExistente] = await Promise.all([
        prisma.usuario.findUnique({ where: { usuario_email: emailNormalizado } }),
        prisma.estagiario.findFirst({
          where: { OR: [{ estagiario_email: emailNormalizado }, { estagiario_cpf: cpfDigitos }] },
        }),
      ])

      if (usuarioExistente || estagiarioExistente) {
        return res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' })
      }

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS)

      const { usuario, estagiario } = await prisma.$transaction(async (tx) => {
        const estagiario = await tx.estagiario.create({
          data: {
            estagiario_email: emailNormalizado,
            estagiario_senha_hash: senhaHash,
            estagiario_nome_completo: nome.trim(),
            estagiario_cpf: cpfDigitos,
          },
        })

        const usuario = await tx.usuario.create({
          data: {
            usuario_nome: nome.trim(),
            usuario_email: emailNormalizado,
            usuario_senha: senhaHash,
            id_estagiario_estagiario: estagiario.id_estagiario,
          },
        })

        return { usuario, estagiario }
      })

      const token = signAuthToken({
        id_usuario: usuario.id_usuario,
        role: 'estagiario',
        id_estagiario: estagiario.id_estagiario,
      })

      return res.status(201).json({ token, role: 'estagiario', estagiario: publicEstagiario(estagiario) })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao cadastrar usuário.' })
    }
  },

  registroEmpresa: async (req: Request, res: Response) => {
    try {
      const {
        nomeEmpresa,
        cnpj,
        email,
        senha,
        setor,
        cidade,
        descricao,
      } = req.body as {
        nomeEmpresa?: string
        cnpj?: string
        email?: string
        senha?: string
        setor?: string
        cidade?: string
        descricao?: string
      }

      if (!nomeEmpresa || !cnpj || !email || !senha) {
        return res.status(400).json({ error: 'Informe nome da empresa, CNPJ, email e senha.' })
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
}
