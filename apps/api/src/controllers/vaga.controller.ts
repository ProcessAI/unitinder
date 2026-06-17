import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const VagaController = {
  listar: async (req: Request, res: Response) => {
    try {
      // TODO: buscar todas as vagas no banco de dados
      // Exemplo futuro:
      // const vagas = await VagaRepository.listar()

      return res.status(501).json({
        mensagem: 'Listagem de vagas ainda nao integrada ao banco de dados.',
      })
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao listar vagas.',
      })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          mensagem: 'Id da vaga e obrigatorio.',
        })
      }

      // TODO: buscar vaga por id no banco de dados
      // Exemplo futuro:
      // const vaga = await VagaRepository.buscarPorId(Number(id))

      return res.status(501).json({
        mensagem: 'Busca de vaga por id ainda nao integrada ao banco de dados.',
      })
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao buscar vaga.',
      })
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
      } = req.body

      if (
        !vaga_titulo ||
        !vaga_descricao ||
        !vaga_area ||
        !vaga_localidade ||
        !vaga_modelo_trabalho ||
        !vaga_tipo_contrato ||
        !vaga_nivel ||
        !vaga_qtd_vagas ||
        !vaga_carga_horaria ||
        !id_empresa_empresa
      ) {
        return res.status(400).json({
          mensagem: 'Preencha todos os campos obrigatorios da vaga.',
        })
      }

      // TODO: criar vaga no banco de dados
      // Exemplo futuro:
      // const novaVaga = await VagaRepository.criar(req.body)

      return res.status(501).json({
        mensagem: 'Criacao de vaga ainda nao integrada ao banco de dados.',
      })
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao criar vaga.',
      })
    }
  },

  atualizar: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          mensagem: 'Id da vaga e obrigatorio.',
        })
      }
      // TODO: atualizar vaga no banco de dados
      // Exemplo futuro:
      // const vagaAtualizada = await VagaRepository.atualizar(Number(id), req.body)

      return res.status(501).json({
        mensagem: 'Atualizacao de vaga ainda nao integrada ao banco de dados.',
      })
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao atualizar vaga.',
      })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        mensagem: 'Id da vaga e obrigatorio.',
      })
    }

    // TODO: remover vaga do banco de dados
    // Exemplo futuro:
    // await VagaRepository.deletar(Number(id))

    return res.status(501).json({
      mensagem: 'Remocao de vaga ainda nao integrada ao banco de dados.',
    })
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao remover vaga.',
      })
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
