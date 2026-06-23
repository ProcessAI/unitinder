import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

const includeMatch = {
  estagiario: {
    include: {
      habilidades: {
        include: {
          habilidade: true,
        },
      },
    },
  },
  vaga: {
    include: {
      empresa: true,
    },
  },
}

export const MatchController = {
  listar: async (req: Request, res: Response) => {
    try {
      const matches = await prisma.match.findMany({
        include: includeMatch,
        orderBy: { match_data: 'desc' },
      })

      return res.json(matches)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar matches.' })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id)
      if (!id) return res.status(400).json({ error: 'Id do match inválido.' })

      const match = await prisma.match.findUnique({
        where: { id_match: id },
        include: includeMatch,
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
      const estagiarioId = parseId(req.params.estagiarioId)
      if (!estagiarioId) return res.status(400).json({ error: 'Id do estagiário inválido.' })

      if (req.auth?.role === 'estagiario' && req.auth.id_estagiario !== estagiarioId) {
        return res.status(403).json({ error: 'Você não pode ver matches de outro estagiário.' })
      }

      const matches = await prisma.match.findMany({
        where: { id_estagiario_estagiario: estagiarioId },
        include: includeMatch,
        orderBy: { match_data: 'desc' },
      })

      return res.json(matches)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar matches do estagiário.' })
    }
  },

  listarPorVaga: async (req: Request, res: Response) => {
    try {
      const vagaId = parseId(req.params.vagaId)
      if (!vagaId) return res.status(400).json({ error: 'Id da vaga inválido.' })

      const vaga = await prisma.vaga.findUnique({ where: { id_vaga: vagaId } })
      if (!vaga) {
        return res.status(404).json({ error: 'Vaga não encontrada.' })
      }

      if (req.auth?.role === 'empresa' && req.auth.id_empresa !== vaga.id_empresa_empresa) {
        return res.status(403).json({ error: 'Você não pode ver candidatos de outra empresa.' })
      }

      const matches = await prisma.match.findMany({
        where: { id_vaga_vagas: vagaId },
        include: includeMatch,
        orderBy: { match_data: 'desc' },
      })

      return res.json(matches)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar candidatos da vaga.' })
    }
  },

  criar: async (req: Request, res: Response) => {
    try {
      const idEstagiario = Number(req.body.id_estagiario_estagiario)
      const idVaga = Number(req.body.id_vaga_vagas)

      if (!idEstagiario || !idVaga) {
        return res.status(400).json({ error: 'Informe estagiário e vaga.' })
      }

      if (req.auth?.id_estagiario !== idEstagiario) {
        return res.status(403).json({ error: 'Você não pode criar candidatura para outro estagiário.' })
      }

      const [estagiario, vaga] = await Promise.all([
        prisma.estagiario.findUnique({ where: { id_estagiario: idEstagiario } }),
        prisma.vaga.findUnique({ where: { id_vaga: idVaga } }),
      ])

      if (!estagiario) return res.status(404).json({ error: 'Estagiário não encontrado.' })
      if (!vaga) return res.status(404).json({ error: 'Vaga não encontrada.' })

      const candidaturaExistente = await prisma.match.findFirst({
        where: {
          id_estagiario_estagiario: idEstagiario,
          id_vaga_vagas: idVaga,
        },
      })

      if (candidaturaExistente) {
        return res.status(409).json({ error: 'Voce já curtiu/se candidatou a esta vaga.' })
      }

      const match = await prisma.match.create({
        data: {
          id_estagiario_estagiario: idEstagiario,
          id_vaga_vagas: idVaga,
          match_status: 'PENDENTE',
        },
        include: includeMatch,
      })

      return res.status(201).json(match)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao criar candidatura.' })
    }
  },

  atualizarStatus: async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id)
      if (!id) return res.status(400).json({ error: 'Id do match inválido.' })

      const statusRecebido = String(req.body.status ?? '').toLowerCase()
      const statusMap: Record<string, string> = {
        aceito: 'ACEITO',
        aprovado: 'ACEITO',
        recusado: 'RECUSADO',
        rejeitado: 'RECUSADO',
      }
      const match_status = statusMap[statusRecebido]

      if (!match_status) {
        return res.status(400).json({ error: 'Status deve ser aceito, em_analise ou recusado.' })
      }

      const matchAtual = await prisma.match.findUnique({
        where: { id_match: id },
        include: { vaga: true },
      })

      if (!matchAtual) {
        return res.status(404).json({ error: 'Match não encontrado.' })
      }

      if (req.auth?.id_empresa !== matchAtual.vaga.id_empresa_empresa) {
        return res.status(403).json({ error: 'Você não pode alterar candidatos de outra empresa.' })
      }

      const match = await prisma.match.update({
        where: { id_match: id },
        data: { match_status },
        include: includeMatch,
      })

      return res.json(match)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar status do match.' })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id)
      if (!id) return res.status(400).json({ error: 'Id do match inválido.' })

      const match = await prisma.match.findUnique({
        where: { id_match: id },
        include: { vaga: true },
      })

      if (!match) {
        return res.status(404).json({ error: 'Match não encontrado.' })
      }

      const podeRemover =
        req.auth?.id_estagiario === match.id_estagiario_estagiario ||
        req.auth?.id_empresa === match.vaga.id_empresa_empresa

      if (!podeRemover) {
        return res.status(403).json({ error: 'Voceª não pode remover este match.' })
      }

      await prisma.match.delete({ where: { id_match: id } })

      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover match.' })
    }
  },
}
