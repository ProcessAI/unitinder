import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAuthToken } from '../utils/jwt'
import { EmpresaController } from './empresa.controller'

const SALT_ROUNDS = 10

export const AuthController = {
  registroEmpresa: (req: Request, res: Response) =>
    EmpresaController.cadastrar(req, res),

  registroUsuario: async (req: Request, res: Response) => {
    try {
      const { nome, email, senha, cpf } = req.body as {
        nome?: string
        email?: string
        senha?: string
        cpf?: string
      }

      if (!nome || !email || !senha || !cpf) {
        return res.status(400).json({ error: 'Informe nome, e-mail, senha e CPF.' })
      }

      if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' })
      }

      const cpfDigitos = cpf.replace(/\D/g, '')
      const emailNormalizado = email.trim().toLowerCase()

      const [estagiarioExistente, usuarioExistente] = await Promise.all([
        prisma.estagiario.findUnique({ where: { estagiario_cpf: cpfDigitos } }),
        prisma.usuario.findUnique({ where: { usuario_email: emailNormalizado } }),
      ])

      if (estagiarioExistente) {
        return res.status(409).json({ error: 'Já existe uma conta com este CPF.' })
      }

      if (usuarioExistente) {
        return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' })
      }

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS)

      const { usuario, estagiario } = await prisma.$transaction(async (tx) => {
        const estagiario = await tx.estagiario.create({
          data: {
            estagiario_nome_completo: nome.trim(),
            estagiario_email: emailNormalizado,
            estagiario_senha_hash: senhaHash,
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
      return res.status(500).json({ error: 'Erro ao cadastrar usuário.' })
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { identificador, senha } = req.body as {
        identificador?: string
        senha?: string
      }

      if (!identificador || !senha) {
        return res.status(400).json({ error: 'Informe e-mail/CNPJ e senha.' })
      }

      const identificadorNormalizado = identificador.trim().toLowerCase()
      const cnpjDigitos = identificador.replace(/\D/g, '')

      let usuario = await prisma.usuario.findUnique({
        where: { usuario_email: identificadorNormalizado },
        include: { empresa: true, estagiario: true },
      })

      if (!usuario && cnpjDigitos.length === 14) {
        const empresa = await prisma.empresa.findUnique({
          where: { empresa_cnpj: cnpjDigitos },
        })
        if (empresa) {
          usuario = await prisma.usuario.findFirst({
            where: { id_empresa_empresa: empresa.id_empresa },
            include: { empresa: true, estagiario: true },
          })
        }
      }

      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas.' })
      }

      const senhaOk = await bcrypt.compare(senha, usuario.usuario_senha)
      if (!senhaOk) {
        return res.status(401).json({ error: 'Credenciais inválidas.' })
      }

      if (usuario.empresa) {
        const token = signAuthToken({
          id_usuario: usuario.id_usuario,
          role: 'empresa',
          id_empresa: usuario.empresa.id_empresa,
        })
        return res.json({
          token,
          role: 'empresa',
          empresa: {
            id: usuario.empresa.id_empresa,
            nome: usuario.empresa.empresa_nome,
            cnpj: usuario.empresa.empresa_cnpj,
          },
        })
      }

      if (usuario.estagiario) {
        const token = signAuthToken({
          id_usuario: usuario.id_usuario,
          role: 'estagiario',
          id_estagiario: usuario.estagiario.id_estagiario,
        })
        return res.json({
          token,
          role: 'estagiario',
          estagiario: {
            id: usuario.estagiario.id_estagiario,
            nome: usuario.estagiario.estagiario_nome_completo,
            email: usuario.estagiario.estagiario_email,
          },
        })
      }

      return res.status(500).json({ error: 'Usuário sem perfil associado.' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao realizar login.' })
    }
  },
}
