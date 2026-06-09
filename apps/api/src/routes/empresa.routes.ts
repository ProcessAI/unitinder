import { Router } from 'express'
import { EmpresaController } from '../controllers/empresa.controller'

const router = Router()

// GET /empresas
router.get('/', EmpresaController.listar)

// GET /empresas/:id
router.get('/:id', EmpresaController.buscarPorId)

// PUT /empresas/:id
router.put('/:id', EmpresaController.atualizar)

// DELETE /empresas/:id
router.delete('/:id', EmpresaController.deletar)

export default router
