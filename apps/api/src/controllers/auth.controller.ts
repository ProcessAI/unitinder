import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAuthToken } from '../utils/jwt'
import { sanitizeCnpj } from '../utils/cnpj'
import { EmpresaController } from './empresa.controller'

export const AuthController = {
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
        // ─── Login empresa (CNPJ) ────────────────────────────────────────────
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
        // ─── Login estagiário (e-mail) ───────────────────────────────────────
        const email = identificador.trim().toLowerCase()

        const estagiario = await prisma.estagiario.findUnique({
          where: { estagiario_email: email },
        })

        if (!estagiario) {
          return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
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

  registroUsuario: async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Não implementado ainda.' })
  },

  registroEmpresa: (req: Request, res: Response) =>
    EmpresaController.cadastrar(req, res),
}