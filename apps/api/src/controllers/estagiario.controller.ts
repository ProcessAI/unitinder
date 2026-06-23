import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

async function recalcularPerfilCompleto(id_estagiario: number) {
  const estagiario = await prisma.estagiario.findUnique({ where: { id_estagiario } })
  if (!estagiario) return

  const completo = Boolean(
    estagiario.estagiario_telefone?.trim() &&
    estagiario.estagiario_instituicao?.trim() &&
    estagiario.estagiario_curso?.trim() &&
    estagiario.estagiario_bio?.trim() &&
    estagiario.estagiario_foto_perfil_url?.trim()
  )

  if (completo !== estagiario.estagiario_perfil_completo) {
    await prisma.estagiario.update({
      where: { id_estagiario },
      data: { estagiario_perfil_completo: completo },
    })
  }

  return completo
}

export const EstagiarioController = {
  listar: async (req: Request, res: Response) => {
    try {
      const estagiarios = await prisma.estagiario.findMany({
        where: { estagiario_ativo: true },
        orderBy: { estagiario_nome_completo: 'asc' },
        select: {
          id_estagiario: true,
          estagiario_email: true,
          estagiario_nome_completo: true,
          estagiario_foto_perfil_url: true,
          estagiario_cidade: true,
          estagiario_estado: true,
          estagiario_disponivel_remoto: true,
          estagiario_instituicao: true,
          estagiario_curso: true,
          estagiario_semestre_atual: true,
          estagiario_turno: true,
          estagiario_area_interesse: true,
          estagiario_nivel_experiencia: true,
          estagiario_modalidade_preferida: true,
          estagiario_carga_horaria_preferida: true,
          estagiario_aceita_bolsa_minima: true,
          estagiario_cv_url: true,
          estagiario_linkedin_url: true,
          estagiario_portfolio_url: true,
          estagiario_bio: true,
          estagiario_perfil_completo: true,
          estagiario_created_at: true,
        },
      })

      return res.json(estagiarios)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar estagiários.' })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)

      const estagiario = await prisma.estagiario.findUnique({
        where: { id_estagiario: id },
        select: {
          id_estagiario: true,
          estagiario_email: true,
          estagiario_nome_completo: true,
          estagiario_cpf: true,
          estagiario_data_nascimento: true,
          estagiario_telefone: true,
          estagiario_foto_perfil_url: true,
          estagiario_cidade: true,
          estagiario_estado: true,
          estagiario_disponivel_remoto: true,
          estagiario_instituicao: true,
          estagiario_curso: true,
          estagiario_semestre_atual: true,
          estagiario_previsao_formatura: true,
          estagiario_turno: true,
          estagiario_area_interesse: true,
          estagiario_nivel_experiencia: true,
          estagiario_modalidade_preferida: true,
          estagiario_carga_horaria_preferida: true,
          estagiario_aceita_bolsa_minima: true,
          estagiario_cv_url: true,
          estagiario_linkedin_url: true,
          estagiario_portfolio_url: true,
          estagiario_bio: true,
          estagiario_ativo: true,
          estagiario_perfil_completo: true,
          estagiario_created_at: true,
          estagiario_updated_at: true,
        },
      })

      if (!estagiario) {
        return res.status(404).json({ error: 'Estagiário não encontrado.' })
      }

      return res.json(estagiario)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao buscar estagiário.' })
    }
  },

  atualizar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)

      if (req.auth?.id_estagiario !== id) {
        return res.status(403).json({ error: 'Você não pode editar o perfil de outro estagiário.' })
      }

      const estagiarioAtual = await prisma.estagiario.findUnique({ where: { id_estagiario: id } })
      if (!estagiarioAtual) {
        return res.status(404).json({ error: 'Estagiário não encontrado.' })
      }

      const {
        estagiario_senha_hash,
        estagiario_cpf,
        estagiario_email,
        id_estagiario,
        estagiario_ativo,
        estagiario_created_at,
        ...dados
      } = req.body as Record<string, unknown>

      const camposData = ['estagiario_previsao_formatura', 'estagiario_data_nascimento'] as const
      for (const campo of camposData) {
        if (dados[campo] !== undefined) {
          const valor = dados[campo]
          dados[campo] = valor ? new Date(valor as string) : null
        }
      }

      const camposNumericos = ['estagiario_semestre_atual', 'estagiario_carga_horaria_preferida'] as const
      for (const campo of camposNumericos) {
        if (dados[campo] !== undefined) {
          const valor = dados[campo]
          dados[campo] = valor === '' || valor === null ? null : Number(valor)
        }
      }

      const estagiario = await prisma.estagiario.update({
        where: { id_estagiario: id },
        data: {
          ...dados,
          estagiario_updated_at: new Date(),
        },
      })

      await recalcularPerfilCompleto(id)
      const estagiarioFinal = await prisma.estagiario.findUnique({ where: { id_estagiario: id } })

      const { estagiario_senha_hash: _, ...estagiarioPublico } = estagiarioFinal ?? estagiario

      return res.json({ message: 'Perfil atualizado com sucesso.', estagiario: estagiarioPublico })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar estagiário.' })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)

      if (req.auth?.id_estagiario !== id) {
        return res.status(403).json({ error: 'Você não pode desativar a conta de outro estagiário.' })
      }

      const estagiario = await prisma.estagiario.findUnique({ where: { id_estagiario: id } })
      if (!estagiario) {
        return res.status(404).json({ error: 'Estagiário não encontrado.' })
      }

      await prisma.estagiario.update({
        where: { id_estagiario: id },
        data: { estagiario_ativo: false, estagiario_updated_at: new Date() },
      })

      return res.json({ message: 'Conta desativada com sucesso.' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao desativar estagiário.' })
    }
  },

  listarHabilidades: async (req: Request, res: Response) => {
    try {
      const id_estagiario = Number(req.params.id)

      const estagiario = await prisma.estagiario.findUnique({ where: { id_estagiario } })
      if (!estagiario) {
        return res.status(404).json({ error: 'Estagiário não encontrado.' })
      }

      const vinculos = await prisma.rlEstagiarioHabilidade.findMany({
        where: { id_estagiario },
        include: { habilidade: true },
      })

      return res.json(vinculos)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar habilidades do estagiário.' })
    }
  },

  adicionarHabilidade: async (req: Request, res: Response) => {
    try {
      const id_estagiario = Number(req.params.id)
      const { id_habilidade } = req.body as { id_habilidade?: number }

      if (!id_habilidade) {
        return res.status(400).json({ error: 'Informe id_habilidade.' })
      }

      const estagiario = await prisma.estagiario.findUnique({ where: { id_estagiario } })
      if (!estagiario) {
        return res.status(404).json({ error: 'Estagiário não encontrado.' })
      }

      const habilidade = await prisma.habilidade.findUnique({ where: { id_habilidade: Number(id_habilidade) } })
      if (!habilidade) {
        return res.status(404).json({
          error: 'Habilidade não encontrada no catálogo global. Cadastre-a primeiro em /habilidades.',
        })
      }

      const jaVinculada = await prisma.rlEstagiarioHabilidade.findFirst({
        where: { id_estagiario, id_habilidade: Number(id_habilidade) },
      })
      if (jaVinculada) {
        return res.status(409).json({ error: 'Esta habilidade já está vinculada ao estagiário.' })
      }

      const vinculo = await prisma.rlEstagiarioHabilidade.create({
        data: { id_estagiario, id_habilidade: Number(id_habilidade) },
        include: { habilidade: true },
      })

      return res.status(201).json({ message: 'Habilidade vinculada ao estagiário com sucesso.', vinculo })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao vincular habilidade.' })
    }
  },

  removerHabilidade: async (req: Request, res: Response) => {
    try {
      const id_estagiario = Number(req.params.id)
      const id_habilidade = Number(req.params.habilidadeId)

      const estagiario = await prisma.estagiario.findUnique({ where: { id_estagiario } })
      if (!estagiario) {
        return res.status(404).json({ error: 'Estagiário não encontrado.' })
      }

      const vinculo = await prisma.rlEstagiarioHabilidade.findFirst({
        where: { id_estagiario, id_habilidade },
      })

      if (!vinculo) {
        return res.status(404).json({ error: 'Vínculo de habilidade não encontrado.' })
      }

      await prisma.rlEstagiarioHabilidade.delete({
        where: { id_estagiario_habilidade: vinculo.id_estagiario_habilidade },
      })

      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover habilidade.' })
    }
  },
}