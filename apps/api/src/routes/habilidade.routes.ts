import { Router } from 'express'
import { HabilidadeController } from '../controllers/habilidade.controller'

const router = Router()

// GET /habilidades
router.get('/', HabilidadeController.listar)

// GET /habilidades/:id
router.get('/:id', HabilidadeController.buscarPorId)

// POST /habilidades
router.post('/', HabilidadeController.criar)

// PUT /habilidades/:id
router.put('/:id', HabilidadeController.atualizar)

// DELETE /habilidades/:id
router.delete('/:id', HabilidadeController.deletar)

export default router
