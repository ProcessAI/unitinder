import { Request, Response } from 'express'
import { EmpresaController } from './empresa.controller'

export const AuthController = {
  login: async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Não implementado ainda.' })
  },

  registroUsuario: async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Não implementado ainda.' })
  },

  registroEmpresa: (req: Request, res: Response) =>
    EmpresaController.cadastrar(req, res),
}