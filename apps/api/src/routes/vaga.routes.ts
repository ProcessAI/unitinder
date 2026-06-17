import { Router } from 'express'
import { VagaController } from '../controllers/vaga.controller'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// GET /vagas
router.get('/', VagaController.listar)

// GET /vagas/:id
router.get('/:id', VagaController.buscarPorId)

// POST /vagas
router.post('/', VagaController.criar)

// PUT /vagas/:id
router.put('/:id', VagaController.atualizar)

// DELETE /vagas/:id
router.delete('/:id', VagaController.deletar)

// GET /vagas/:id/habilidades — habilidades exigidas pela vaga
router.get('/:id/habilidades', VagaController.listarHabilidades)

// POST /vagas/:id/habilidades — vincular habilidade à vaga
router.post('/:id/habilidades', VagaController.adicionarHabilidade)

// DELETE /vagas/:id/habilidades/:habilidadeId — desvincular habilidade
router.delete('/:id/habilidades/:habilidadeId', VagaController.removerHabilidade)

export default router
