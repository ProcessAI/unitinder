import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const HABILIDADES_PADRAO = [
  { habilidade_nome: 'React', habilidade_categoria: 'tecnica' },
  { habilidade_nome: 'JavaScript', habilidade_categoria: 'tecnica' },
  { habilidade_nome: 'TypeScript', habilidade_categoria: 'tecnica' },
  { habilidade_nome: 'Node.js', habilidade_categoria: 'tecnica' },
  { habilidade_nome: 'Python', habilidade_categoria: 'tecnica' },
  { habilidade_nome: 'SQL', habilidade_categoria: 'tecnica' },
  { habilidade_nome: 'Git', habilidade_categoria: 'ferramenta' },
  { habilidade_nome: 'Figma', habilidade_categoria: 'ferramenta' },
  { habilidade_nome: 'Inglês', habilidade_categoria: 'idioma' },
  { habilidade_nome: 'Comunicação', habilidade_categoria: 'comportamental' },
  { habilidade_nome: 'Trabalho em equipe', habilidade_categoria: 'comportamental' },
  { habilidade_nome: 'Proatividade', habilidade_categoria: 'comportamental' },
]

export const HabilidadeController = {
  listar: async (req: Request, res: Response) => {
    try {
      const total = await prisma.habilidade.count()

      if (total === 0) {
        await prisma.habilidade.createMany({ data: HABILIDADES_PADRAO })
      }

      const habilidades = await prisma.habilidade.findMany({ orderBy: { habilidade_nome: 'asc' } })
      return res.json(habilidades)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar habilidades.' })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const habilidade = await prisma.habilidade.findUnique({ where: { id_habilidade: id } })

      if (!habilidade) {
        return res.status(404).json({ error: 'Habilidade não encontrada.' })
      }

      return res.json(habilidade)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao buscar habilidade.' })
    }
  },

  criar: async (req: Request, res: Response) => {
    try {
      const { habilidade_nome, habilidade_categoria, habilidade_nivel, habilidade_descricao } = req.body as {
        habilidade_nome?: string
        habilidade_categoria?: string
        habilidade_nivel?: string
        habilidade_descricao?: string
      }

      if (!habilidade_nome) {
        return res.status(400).json({ error: 'Informe habilidade_nome.' })
      }

      const habilidade = await prisma.habilidade.create({
        data: { habilidade_nome, habilidade_categoria, habilidade_nivel, habilidade_descricao },
      })

      return res.status(201).json(habilidade)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao criar habilidade.' })
    }
  },

  atualizar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const dados = req.body as Record<string, unknown>

      const habilidadeAtual = await prisma.habilidade.findUnique({ where: { id_habilidade: id } })
      if (!habilidadeAtual) {
        return res.status(404).json({ error: 'Habilidade não encontrada.' })
      }

      const habilidade = await prisma.habilidade.update({ where: { id_habilidade: id }, data: dados })
      return res.json(habilidade)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar habilidade.' })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const habilidade = await prisma.habilidade.findUnique({ where: { id_habilidade: id } })

      if (!habilidade) {
        return res.status(404).json({ error: 'Habilidade não encontrada.' })
      }

      await prisma.habilidade.delete({ where: { id_habilidade: id } })
      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover habilidade.' })
    }
  },
}
