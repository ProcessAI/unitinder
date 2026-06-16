import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { isValidCnpj, sanitizeCnpj } from '../utils/cnpj'

export const EmpresaController = {
  listar: async (req: Request, res: Response) => {
    try {
      const empresas = await prisma.empresa.findMany({ orderBy: { id_empresa: 'asc' } })
      return res.json(empresas)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar empresas.' })
    }
  },

  buscarPorId: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const empresa = await prisma.empresa.findUnique({ where: { id_empresa: id } })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      return res.json(empresa)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao buscar empresa.' })
    }
  },

  atualizar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const { nomeEmpresa, cnpj, setor, cidade, descricao } = req.body as {
        nomeEmpresa?: string
        cnpj?: string
        setor?: string
        cidade?: string
        descricao?: string
      }

      const empresaAtual = await prisma.empresa.findUnique({ where: { id_empresa: id } })
      if (!empresaAtual) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      let cnpjDigitos: string | undefined
      if (cnpj !== undefined) {
        if (!isValidCnpj(cnpj)) {
          return res.status(400).json({ error: 'CNPJ inválido. Informe os 14 dígitos de um CNPJ válido.' })
        }
        cnpjDigitos = sanitizeCnpj(cnpj)

        const cnpjEmUso = await prisma.empresa.findUnique({ where: { empresa_cnpj: cnpjDigitos } })
        if (cnpjEmUso && cnpjEmUso.id_empresa !== id) {
          return res.status(409).json({ error: 'Já existe uma empresa cadastrada com este CNPJ.' })
        }
      }

      const empresa = await prisma.empresa.update({
        where: { id_empresa: id },
        data: {
          empresa_nome: nomeEmpresa?.trim() ?? undefined,
          empresa_cnpj: cnpjDigitos,
          empresa_setor: setor !== undefined ? setor.trim() || null : undefined,
          empresa_cidade: cidade !== undefined ? cidade.trim() || null : undefined,
          empresa_descricao: descricao !== undefined ? descricao.trim() || null : undefined,
        },
      })

      return res.json(empresa)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar empresa.' })
    }
  },

  deletar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id)
      const empresa = await prisma.empresa.findUnique({ where: { id_empresa: id } })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada.' })
      }

      await prisma.empresa.delete({ where: { id_empresa: id } })
      return res.status(204).send()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover empresa.' })
    }
  },
}
