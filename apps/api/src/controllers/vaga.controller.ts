import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const VagaController = {
  listar: async (req: Request, res: Response) => {
    try {
      const id_empresa = req.query.id_empresa_empresa ? Number(req.query.id_empresa_empresa) : undefined

      const vagas = await prisma.vaga.findMany({
        where: id_empresa ? { id_empresa_empresa: id_empresa } : undefined,
        include: { habilidades: { include: { habilidade: true } } },
        orderBy: { vaga_created_at: 'desc' },
      })

      return res.json(vagas)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ mensagem: 'Erro ao listar vagas.' })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)

      const vaga = await prisma.vaga.findUnique({
        where: { id_vaga: id },
        include: { habilidades: { include: { habilidade: true } } },
      })

      if (!vaga) {
        return res.status(404).json({ mensagem: 'Vaga não encontrada.' })
      }

      return res.json(vaga)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ mensagem: 'Erro ao buscar vaga.' })
    }
  },

  criar: async (req: Request, res: Response) => {
    try {
      const {
        vaga_titulo,
        vaga_descricao,
        vaga_area,
        vaga_localidade,
        vaga_modelo_trabalho,
        vaga_tipo_contrato,
        vaga_nivel,
        vaga_qtd_vagas,
        vaga_carga_horaria,
        id_empresa_empresa,
        vaga_pcd,
        vaga_salario_min,
        vaga_salario_max,
        vaga_beneficios,
        vaga_escolaridade_minima,
        vaga_experiencia_minima,
        vaga_prazo_candidatura,
      } = req.body

      if (!vaga_titulo || !vaga_descricao || !vaga_area || !vaga_localidade ||
          !vaga_modelo_trabalho || !vaga_tipo_contrato || !vaga_nivel ||
          !vaga_qtd_vagas || !id_empresa_empresa) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios da vaga.' })
      }

      const vaga = await prisma.vaga.create({
        data: {
          vaga_titulo,
          vaga_descricao,
          vaga_area,
          vaga_localidade,
          vaga_modelo_trabalho,
          vaga_tipo_contrato,
          vaga_nivel,
          vaga_qtd_vagas: Number(vaga_qtd_vagas),
          vaga_carga_horaria,
          id_empresa_empresa: Number(id_empresa_empresa),
          vaga_pcd: vaga_pcd ?? false,
          vaga_salario_min: vaga_salario_min ?? null,
          vaga_salario_max: vaga_salario_max ?? null,
          vaga_beneficios: vaga_beneficios ?? null,
          vaga_escolaridade_minima: vaga_escolaridade_minima ?? null,
          vaga_experiencia_minima: vaga_experiencia_minima ?? null,
          vaga_prazo_candidatura: vaga_prazo_candidatura ? new Date(vaga_prazo_candidatura) : null,
          vaga_data_publicacao: new Date(),
        },
        include: { habilidades: { include: { habilidade: true } } },
      })

      return res.status(201).json(vaga)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ mensagem: 'Erro ao criar vaga.' })
    }
  },

  atualizar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)

      const vagaAtual = await prisma.vaga.findUnique({ where: { id_vaga: id } })
      if (!vagaAtual) {
        return res.status(404).json({ mensagem: 'Vaga não encontrada.' })
      }

      const dados = { ...req.body, vaga_updated_at: new Date() }
      if (dados.vaga_prazo_candidatura) {
        dados.vaga_prazo_candidatura = new Date(dados.vaga_prazo_candidatura)
      }

      const vaga = await prisma.vaga.update({
        where: { id_vaga: id },
        data: dados,
        include: { habilidades: { include: { habilidade: true } } },
      })

      return res.json(vaga)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ mensagem: 'Erro ao atualizar vaga.' })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)

      const vaga = await prisma.vaga.findUnique({ where: { id_vaga: id } })
      if (!vaga) {
        return res.status(404).json({ mensagem: 'Vaga não encontrada.' })
      }

      await prisma.vaga.delete({ where: { id_vaga: id } })
      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ mensagem: 'Erro ao remover vaga.' })
    }
  },

  listarHabilidades: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)

      const vaga = await prisma.vaga.findUnique({ where: { id_vaga: id } })
      if (!vaga) {
        return res.status(404).json({ mensagem: 'Vaga não encontrada.' })
      }

      const registros = await prisma.rlVagaHabilidade.findMany({
        where: { id_vaga: id },
        include: { habilidade: true },
      })

      return res.json(registros.map((r) => r.habilidade))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ mensagem: 'Erro ao listar habilidades da vaga.' })
    }
  },

  adicionarHabilidade: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const { id_habilidade } = req.body as { id_habilidade?: number }

      if (!id_habilidade) {
        return res.status(400).json({ mensagem: 'id_habilidade é obrigatório.' })
      }

      const vaga = await prisma.vaga.findUnique({ where: { id_vaga: id } })
      if (!vaga) {
        return res.status(404).json({ mensagem: 'Vaga não encontrada.' })
      }

      const habilidade = await prisma.habilidade.findUnique({ where: { id_habilidade } })
      if (!habilidade) {
        return res.status(404).json({ mensagem: 'Habilidade não encontrada.' })
      }

      const jaExiste = await prisma.rlVagaHabilidade.findFirst({
        where: { id_vaga: id, id_habilidade },
      })
      if (jaExiste) {
        return res.status(409).json({ mensagem: 'Habilidade já associada a esta vaga.' })
      }

      const associacao = await prisma.rlVagaHabilidade.create({
        data: { id_vaga: id, id_habilidade },
        include: { habilidade: true },
      })

      return res.status(201).json(associacao)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ mensagem: 'Erro ao adicionar habilidade à vaga.' })
    }
  },

  removerHabilidade: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const idHabilidade = Number(req.params.habilidadeId)

      const associacao = await prisma.rlVagaHabilidade.findFirst({
        where: { id_vaga: id, id_habilidade: idHabilidade },
      })

      if (!associacao) {
        return res.status(404).json({ mensagem: 'Associação não encontrada.' })
      }

      await prisma.rlVagaHabilidade.delete({
        where: { id_vaga_habilidade: associacao.id_vaga_habilidade },
      })

      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ mensagem: 'Erro ao remover habilidade da vaga.' })
    }
  },
}
