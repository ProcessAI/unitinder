import { Router } from 'express'
import { EmpresaController } from '../controllers/empresa.controller'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// GET /empresas
router.get('/', EmpresaController.listar)

// GET /empresas/:id
router.get('/:id', EmpresaController.buscarPorId)

// PUT /empresas/:id
router.put('/:id', authMiddleware, requireRole('empresa'), EmpresaController.atualizar)

// DELETE /empresas/:id
router.delete('/:id', authMiddleware, requireRole('empresa'), EmpresaController.deletar)

export default router
