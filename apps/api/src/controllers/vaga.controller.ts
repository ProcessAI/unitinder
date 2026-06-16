import { Request, Response } from 'express'

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
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        mensagem: 'Id da vaga e obrigatorio.',
      })
    }

    // TODO: listar habilidades da vaga no banco de dados
    // Exemplo futuro:
    // const habilidades = await VagaRepository.listarHabilidades(Number(id))

    return res.status(501).json({
      mensagem: 'Listagem de habilidades ainda nao integrada ao banco de dados.',
    })
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao listar habilidades da vaga.',
      })
    }

  },

  adicionarHabilidade: async (req: Request, res: Response) => {
    try {
    const { id } = req.params
    const { id_habilidade } = req.body

    if (!id) {
      return res.status(400).json({
        mensagem: 'Id da vaga e obrigatorio.',
      })
    }

    if (!id_habilidade) {
      return res.status(400).json({
        mensagem: 'Id da habilidade e obrigatorio.',
      })
    }

    // TODO: associar habilidade a vaga no banco de dados
    // Exemplo futuro:
    // await VagaRepository.adicionarHabilidade(
    //   Number(id),
    //   Number(id_habilidade)
    // )

    return res.status(501).json({
      mensagem: 'Adicao de habilidade ainda nao integrada ao banco de dados.',
    })
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao adicionar habilidade.',
      })
    }
  },
  
  removerHabilidade: async (req: Request, res: Response) => {
    try {
    const { id, idHabilidade } = req.params

    if (!id) {
      return res.status(400).json({
        mensagem: 'Id da vaga e obrigatorio.',
      })
    }

    if (!idHabilidade) {
      return res.status(400).json({
        mensagem: 'Id da habilidade e obrigatorio.',
      })
    }

    // TODO: remover associacao da habilidade com a vaga
    // Exemplo futuro:
    // await VagaRepository.removerHabilidade(
    //   Number(id),
    //   Number(idHabilidade)
    // )

    return res.status(501).json({
      mensagem: 'Remocao de habilidade ainda nao integrada ao banco de dados.',
    })
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao remover habilidade.',
      })
    }
  },
}
