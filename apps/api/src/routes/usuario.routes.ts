import { Router } from 'express'
import { UsuarioController } from '../controllers/usuario.controller'

const router = Router()

// GET /usuarios
router.get('/', UsuarioController.listar)

// GET /usuarios/:id
router.get('/:id', UsuarioController.buscarPorId)

// PUT /usuarios/:id
router.put('/:id', UsuarioController.atualizar)

// DELETE /usuarios/:id
router.delete('/:id', UsuarioController.deletar)

export default router
