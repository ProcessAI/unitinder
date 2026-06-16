import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const VagaController = {
  listar: async (req: Request, res: Response) => {
    try {
      const { id_empresa_empresa } = req.query as { id_empresa_empresa?: string }

      const vagas = await prisma.vaga.findMany({
        where: id_empresa_empresa ? { id_empresa_empresa: Number(id_empresa_empresa) } : undefined,
        orderBy: { id_vaga: 'desc' },
        include: { empresa: true },
      })

      return res.json(vagas)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar vagas.' })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const vaga = await prisma.vaga.findUnique({ where: { id_vaga: id }, include: { empresa: true } })

      if (!vaga) {
        return res.status(404).json({ error: 'Vaga não encontrada.' })
      }

      return res.json(vaga)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao buscar vaga.' })
    }
  },

  criar: async (req: Request, res: Response) => {
    try {
      const {
        id_empresa_empresa,
        vaga_titulo,
        vaga_descricao,
        vaga_area,
        vaga_localidade,
        vaga_modelo_trabalho,
        vaga_tipo_contrato,
        vaga_nivel,
        vaga_qtd_vagas,
        vaga_pcd,
        vaga_salario_min,
        vaga_salario_max,
        vaga_beneficios,
        vaga_carga_horaria,
        vaga_escolaridade_minima,
        vaga_experiencia_minima,
        vaga_prazo_candidatura,
      } = req.body as Record<string, any>

      if (!id_empresa_empresa || !vaga_titulo) {
        return res.status(400).json({ error: 'Informe id_empresa_empresa e vaga_titulo.' })
      }

      const empresa = await prisma.empresa.findUnique({ where: { id_empresa: Number(id_empresa_empresa) } })
      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      const vaga = await prisma.vaga.create({
        data: {
          id_empresa_empresa: Number(id_empresa_empresa),
          vaga_titulo,
          vaga_descricao,
          vaga_area,
          vaga_localidade,
          vaga_modelo_trabalho,
          vaga_tipo_contrato,
          vaga_nivel,
          vaga_qtd_vagas: vaga_qtd_vagas !== undefined ? Number(vaga_qtd_vagas) : undefined,
          vaga_pcd: vaga_pcd !== undefined ? Boolean(vaga_pcd) : undefined,
          vaga_salario_min,
          vaga_salario_max,
          vaga_beneficios,
          vaga_carga_horaria,
          vaga_escolaridade_minima,
          vaga_experiencia_minima,
          vaga_prazo_candidatura: vaga_prazo_candidatura ? new Date(vaga_prazo_candidatura) : undefined,
          vaga_data_publicacao: new Date(),
        },
      })

      return res.status(201).json(vaga)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao criar vaga.' })
    }
  },

  atualizar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const { id_empresa_empresa, id_vaga, ...dados } = req.body as Record<string, any>

      const vagaAtual = await prisma.vaga.findUnique({ where: { id_vaga: id } })
      if (!vagaAtual) {
        return res.status(404).json({ error: 'Vaga não encontrada.' })
      }

      if (dados.vaga_prazo_candidatura) {
        dados.vaga_prazo_candidatura = new Date(dados.vaga_prazo_candidatura)
      }

      const vaga = await prisma.vaga.update({ where: { id_vaga: id }, data: dados })
      return res.json(vaga)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar vaga.' })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const vaga = await prisma.vaga.findUnique({ where: { id_vaga: id } })

      if (!vaga) {
        return res.status(404).json({ error: 'Vaga não encontrada.' })
      }

      await prisma.vaga.delete({ where: { id_vaga: id } })
      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover vaga.' })
    }
  },

  listarHabilidades: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const vinculos = await prisma.rlVagaHabilidade.findMany({
        where: { id_vaga: id },
        include: { habilidade: true },
      })

      return res.json(vinculos.map((v) => v.habilidade))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar habilidades da vaga.' })
    }
  },

  adicionarHabilidade: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const { id_habilidade } = req.body as { id_habilidade?: number }

      if (!id_habilidade) {
        return res.status(400).json({ error: 'Informe id_habilidade.' })
      }

      const vinculo = await prisma.rlVagaHabilidade.create({
        data: { id_vaga: id, id_habilidade },
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

      await prisma.rlVagaHabilidade.deleteMany({
        where: { id_vaga: id, id_habilidade: habilidadeId },
      })

      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover habilidade.' })
    }
  },
}
