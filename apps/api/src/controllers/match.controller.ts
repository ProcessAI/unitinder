import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const STATUS_VALIDOS = ['PENDENTE', 'ACEITO', 'RECUSADO']

const ESTAGIARIO_SEGURO = {
  id_estagiario: true,
  estagiario_nome_completo: true,
  estagiario_email: true,
  estagiario_curso: true,
  estagiario_instituicao: true,
  estagiario_cidade: true,
  estagiario_estado: true,
} as const

export const MatchController = {
  listar: async (req: Request, res: Response) => {
    try {
      const matches = await prisma.match.findMany({
        orderBy: { match_data: 'desc' },
        include: { estagiario: { select: ESTAGIARIO_SEGURO }, vaga: true },
      })
      return res.json(matches)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar matches.' })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const match = await prisma.match.findUnique({
        where: { id_match: id },
        include: { estagiario: { select: ESTAGIARIO_SEGURO }, vaga: true },
      })

      if (!match) {
        return res.status(404).json({ error: 'Match não encontrado.' })
      }

      return res.json(match)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao buscar match.' })
    }
  },

  listarPorEstagiario: async (req: Request, res: Response) => {
    try {
      const estagiarioId = Number(req.params.estagiarioId)
      const matches = await prisma.match.findMany({
        where: { id_estagiario_estagiario: estagiarioId },
        orderBy: { match_data: 'desc' },
        include: {
          vaga: {
            include: {
              empresa: { include: { usuarios: { select: { usuario_email: true } } } },
            },
          },
        },
      })

      return res.json(matches)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar matches do estagiário.' })
    }
  },

  listarPorVaga: async (req: Request, res: Response) => {
    try {
      const vagaId = Number(req.params.vagaId)
      const matches = await prisma.match.findMany({
        where: { id_vaga_vagas: vagaId },
        orderBy: { match_data: 'desc' },
        include: { estagiario: { select: ESTAGIARIO_SEGURO } },
      })

      return res.json(matches)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar candidatos da vaga.' })
    }
  },

  criar: async (req: Request, res: Response) => {
    try {
      const { id_estagiario_estagiario, id_vaga_vagas } = req.body as {
        id_estagiario_estagiario?: number
        id_vaga_vagas?: number
      }

      if (!id_estagiario_estagiario || !id_vaga_vagas) {
        return res.status(400).json({ error: 'Informe id_estagiario_estagiario e id_vaga_vagas.' })
      }

      const [estagiario, vaga] = await Promise.all([
        prisma.estagiario.findUnique({ where: { id_estagiario: Number(id_estagiario_estagiario) } }),
        prisma.vaga.findUnique({ where: { id_vaga: Number(id_vaga_vagas) } }),
      ])

      if (!estagiario) {
        return res.status(404).json({ error: 'Estagiário não encontrado.' })
      }

      if (!vaga) {
        return res.status(404).json({ error: 'Vaga não encontrada.' })
      }

      const matchExistente = await prisma.match.findFirst({
        where: {
          id_estagiario_estagiario: Number(id_estagiario_estagiario),
          id_vaga_vagas: Number(id_vaga_vagas),
        },
      })

      if (matchExistente) {
        return res.status(409).json({ error: 'Você já se candidatou a esta vaga.' })
      }

      const match = await prisma.match.create({
        data: {
          id_estagiario_estagiario: Number(id_estagiario_estagiario),
          id_vaga_vagas: Number(id_vaga_vagas),
        },
        include: { estagiario: { select: ESTAGIARIO_SEGURO }, vaga: true },
      })

      return res.status(201).json(match)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao criar candidatura.' })
    }
  },

  atualizarStatus: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const { status } = req.body as { status?: string }

      const statusNormalizado = status?.trim().toUpperCase()

      if (!statusNormalizado || !STATUS_VALIDOS.includes(statusNormalizado)) {
        return res.status(400).json({ error: `Status inválido. Use um dos valores: ${STATUS_VALIDOS.join(', ')}.` })
      }

      const matchAtual = await prisma.match.findUnique({ where: { id_match: id } })
      if (!matchAtual) {
        return res.status(404).json({ error: 'Match não encontrado.' })
      }

      const match = await prisma.match.update({
        where: { id_match: id },
        data: { match_status: statusNormalizado },
        include: { estagiario: { select: ESTAGIARIO_SEGURO }, vaga: true },
      })

      return res.json(match)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar status do match.' })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const match = await prisma.match.findUnique({ where: { id_match: id } })

      if (!match) {
        return res.status(404).json({ error: 'Match não encontrado.' })
      }

      await prisma.match.delete({ where: { id_match: id } })
      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover match.' })
    }
  },
}
