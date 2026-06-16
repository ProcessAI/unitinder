import { Router } from 'express'
import { EstagiarioController } from '../controllers/estagiario.controller'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// GET /estagiarios
router.get('/', EstagiarioController.listar)

// GET /estagiarios/:id
router.get('/:id', EstagiarioController.buscarPorId)

// PUT /estagiarios/:id
router.put('/:id', authMiddleware, requireRole('estagiario'), EstagiarioController.atualizar)

// DELETE /estagiarios/:id
router.delete('/:id', authMiddleware, requireRole('estagiario'), EstagiarioController.deletar)

// GET /estagiarios/:id/habilidades — habilidades vinculadas ao estagiário
router.get('/:id/habilidades', EstagiarioController.listarHabilidades)

// POST /estagiarios/:id/habilidades — vincular habilidade ao estagiário
router.post('/:id/habilidades', EstagiarioController.adicionarHabilidade)

// DELETE /estagiarios/:id/habilidades/:habilidadeId — desvincular habilidade
router.delete('/:id/habilidades/:habilidadeId', EstagiarioController.removerHabilidade)

export default router
