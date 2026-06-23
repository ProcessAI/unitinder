import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAuthToken } from '../utils/jwt'
import { sanitizeCnpj } from '../utils/cnpj'
import { EmpresaController } from './empresa.controller'

const SALT_ROUNDS = 10

export const AuthController = {
  // ─── POST /auth/login ──────────────────────────────────────────────────────
  login: async (req: Request, res: Response) => {
    try {
      const { identificador, senha } = req.body as {
        identificador?: string
        senha?: string
      }

      if (!identificador || !senha) {
        return res.status(400).json({ error: 'Informe o identificador e a senha.' })
      }

      const digits = identificador.replace(/\D/g, '')
      const isEmpresa = digits.length === 14

      if (isEmpresa) {
        // ─── Login empresa (CNPJ) ──────────────────────────────────────────
        const cnpj = sanitizeCnpj(identificador)

        const empresa = await prisma.empresa.findUnique({
          where: { empresa_cnpj: cnpj },
        })

        if (!empresa) {
          return res.status(401).json({ error: 'CNPJ ou senha inválidos.' })
        }

        const usuario = await prisma.usuario.findFirst({
          where: { id_empresa_empresa: empresa.id_empresa },
        })

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

        return res.json({
          token,
          role: 'empresa',
          empresa: {
            id: empresa.id_empresa,
            nome: empresa.empresa_nome,
            cnpj: empresa.empresa_cnpj,
          },
        })
      } else {
        // ─── Login estagiário (e-mail) ─────────────────────────────────────
        const email = identificador.trim().toLowerCase()

        const estagiario = await prisma.estagiario.findUnique({
          where: { estagiario_email: email },
        })

        if (!estagiario) {
          return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
        }

        if (!estagiario.estagiario_ativo) {
          return res.status(403).json({ error: 'Conta desativada.' })
        }

        const senhaCorreta = await bcrypt.compare(senha, estagiario.estagiario_senha_hash)
        if (!senhaCorreta) {
          return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
        }

        const usuario = await prisma.usuario.findFirst({
          where: { id_estagiario_estagiario: estagiario.id_estagiario },
        })

        const token = signAuthToken({
          id_usuario: usuario?.id_usuario ?? 0,
          role: 'estagiario',
          id_estagiario: estagiario.id_estagiario,
        })

        return res.json({
          token,
          role: 'estagiario',
          estagiario: {
            id: estagiario.id_estagiario,
            nome: estagiario.estagiario_nome_completo,
            email: estagiario.estagiario_email,
          },
        })
      }
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao realizar login.' })
    }
  },

  // ─── POST /auth/registro/usuario ──────────────────────────────────────────
  registroUsuario: async (req: Request, res: Response) => {
    try {
      const {
        nome,
        email,
        senha,
        cpf,
        data_nascimento,
        telefone,
        foto_perfil_url,
        cidade,
        estado,
        disponivel_remoto,
        instituicao,
        curso,
        semestre_atual,
        previsao_formatura,
        turno,
        area_interesse,
        nivel_experiencia,
        modalidade_preferida,
        carga_horaria_preferida,
        aceita_bolsa_minima,
        cv_url,
        linkedin_url,
        portfolio_url,
        bio,
      } = req.body as Record<string, any>

      if (!nome || !email || !senha || !cpf) {
        return res.status(400).json({ error: 'Informe nome, e-mail, senha e CPF.' })
      }

      if (senha.length < 8) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres.' })
      }

      const cpfDigitos = String(cpf).replace(/\D/g, '')
      if (cpfDigitos.length !== 11) {
        return res.status(400).json({ error: 'CPF inválido.' })
      }

      const emailNormalizado = String(email).trim().toLowerCase()

      const [usuarioExistente, estagiarioExistente] = await Promise.all([
        prisma.usuario.findUnique({ where: { usuario_email: emailNormalizado } }),
        prisma.estagiario.findUnique({ where: { estagiario_cpf: cpfDigitos } }),
      ])

      if (usuarioExistente) {
        return res.status(409).json({ error: 'Já existe uma conta cadastrada com este e-mail.' })
      }

      if (estagiarioExistente) {
        return res.status(409).json({ error: 'Já existe um cadastro com este CPF.' })
      }

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS)

      const { usuario, estagiario } = await prisma.$transaction(async (tx) => {
        const estagiario = await tx.estagiario.create({
          data: {
            estagiario_email: emailNormalizado,
            estagiario_senha_hash: senhaHash,
            estagiario_nome_completo: String(nome).trim(),
            estagiario_cpf: cpfDigitos,
            estagiario_data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
            estagiario_telefone: telefone || null,
            estagiario_foto_perfil_url: foto_perfil_url || null,
            estagiario_cidade: cidade || null,
            estagiario_estado: estado || null,
            estagiario_disponivel_remoto: disponivel_remoto ?? false,
            estagiario_instituicao: instituicao || null,
            estagiario_curso: curso || null,
            estagiario_semestre_atual: semestre_atual ? Number(semestre_atual) : null,
            estagiario_previsao_formatura: previsao_formatura ? new Date(previsao_formatura) : null,
            estagiario_turno: turno || null,
            estagiario_area_interesse: area_interesse || null,
            estagiario_nivel_experiencia: nivel_experiencia || null,
            estagiario_modalidade_preferida: modalidade_preferida || null,
            estagiario_carga_horaria_preferida: carga_horaria_preferida ? Number(carga_horaria_preferida) : null,
            estagiario_aceita_bolsa_minima: aceita_bolsa_minima ?? false,
            estagiario_cv_url: cv_url || null,
            estagiario_linkedin_url: linkedin_url || null,
            estagiario_portfolio_url: portfolio_url || null,
            estagiario_bio: bio || null,
          },
        })

        const usuario = await tx.usuario.create({
          data: {
            usuario_nome: String(nome).trim(),
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

      return res.status(201).json({
        token,
        role: 'estagiario',
        estagiario: {
          id: estagiario.id_estagiario,
          nome: estagiario.estagiario_nome_completo,
          email: estagiario.estagiario_email,
        },
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao cadastrar estagiário.' })
    }
  },

  // ─── POST /auth/registro/empresa ──────────────────────────────────────────
  registroEmpresa: (req: Request, res: Response) =>
    EmpresaController.cadastrar(req, res),
}