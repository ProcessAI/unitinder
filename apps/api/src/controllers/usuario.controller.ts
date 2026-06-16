import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

function semSenha(usuario: { usuario_senha: string } & Record<string, unknown>) {
  const { usuario_senha, ...resto } = usuario
  return resto
}

export const UsuarioController = {
  listar: async (req: Request, res: Response) => {
    try {
      const usuarios = await prisma.usuario.findMany({ orderBy: { id_usuario: 'asc' } })
      return res.json(usuarios.map(semSenha))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar usuários.' })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const usuario = await prisma.usuario.findUnique({ where: { id_usuario: id } })

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' })
      }

      return res.json(semSenha(usuario))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao buscar usuário.' })
    }
  },

  atualizar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const { usuario_nome, usuario_status } = req.body as { usuario_nome?: string; usuario_status?: string }

      const usuarioAtual = await prisma.usuario.findUnique({ where: { id_usuario: id } })
      if (!usuarioAtual) {
        return res.status(404).json({ error: 'Usuário não encontrado.' })
      }

      const usuario = await prisma.usuario.update({
        where: { id_usuario: id },
        data: {
          usuario_nome: usuario_nome?.trim(),
          usuario_status,
        },
      })

      return res.json(semSenha(usuario))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar usuário.' })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const usuario = await prisma.usuario.findUnique({ where: { id_usuario: id } })

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' })
      }

      await prisma.usuario.delete({ where: { id_usuario: id } })
      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover usuário.' })
    }
  },
}
