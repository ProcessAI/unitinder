import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

function semSenha(estagiario: { estagiario_senha_hash: string } & Record<string, unknown>) {
  const { estagiario_senha_hash, ...resto } = estagiario
  return resto
}

export const EstagiarioController = {
  listar: async (req: Request, res: Response) => {
    try {
      const estagiarios = await prisma.estagiario.findMany({ orderBy: { id_estagiario: 'asc' } })
      return res.json(estagiarios.map(semSenha))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar estagiários.' })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const estagiario = await prisma.estagiario.findUnique({ where: { id_estagiario: id } })

      if (!estagiario) {
        return res.status(404).json({ error: 'Estagiário não encontrado.' })
      }

      return res.json(semSenha(estagiario))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao buscar estagiário.' })
    }
  },

  atualizar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const dados = req.body as Record<string, unknown>

      const estagiarioAtual = await prisma.estagiario.findUnique({ where: { id_estagiario: id } })
      if (!estagiarioAtual) {
        return res.status(404).json({ error: 'Estagiário não encontrado.' })
      }

      const {
        estagiario_email,
        estagiario_senha_hash,
        estagiario_cpf,
        id_estagiario,
        ...camposPermitidos
      } = dados as any

      const estagiario = await prisma.estagiario.update({
        where: { id_estagiario: id },
        data: camposPermitidos,
      })

      return res.json(semSenha(estagiario))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar estagiário.' })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const estagiario = await prisma.estagiario.findUnique({ where: { id_estagiario: id } })

      if (!estagiario) {
        return res.status(404).json({ error: 'Estagiário não encontrado.' })
      }

      await prisma.estagiario.delete({ where: { id_estagiario: id } })
      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover estagiário.' })
    }
  },

  listarHabilidades: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const vinculos = await prisma.rlEstagiarioHabilidade.findMany({
        where: { id_estagiario: id },
        include: { habilidade: true },
      })

      return res.json(vinculos.map((v) => v.habilidade))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar habilidades do estagiário.' })
    }
  },

  adicionarHabilidade: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const { id_habilidade } = req.body as { id_habilidade?: number }

      if (!id_habilidade) {
        return res.status(400).json({ error: 'Informe id_habilidade.' })
      }

      const vinculo = await prisma.rlEstagiarioHabilidade.create({
        data: { id_estagiario: id, id_habilidade },
        include: { habilidade: true },
      })

      return res.status(201).json(vinculo)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao vincular habilidade.' })
    }
  },

  removerHabilidade: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const habilidadeId = Number(req.params.habilidadeId)

      await prisma.rlEstagiarioHabilidade.deleteMany({
        where: { id_estagiario: id, id_habilidade: habilidadeId },
      })

      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover habilidade.' })
    }
  },
}
