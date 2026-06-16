import { Router } from 'express'
import { MatchController } from '../controllers/match.controller'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// GET /matches
router.get('/', authMiddleware, MatchController.listar)

// GET /matches/:id
router.get('/:id', authMiddleware, MatchController.buscarPorId)

// GET /matches/estagiario/:estagiarioId — matches de um estagiário
router.get('/estagiario/:estagiarioId', authMiddleware, MatchController.listarPorEstagiario)

// GET /matches/vaga/:vagaId — candidatos de uma vaga
router.get('/vaga/:vagaId', authMiddleware, MatchController.listarPorVaga)

// POST /matches — estagiário aplica para uma vaga
router.post('/', authMiddleware, requireRole('estagiario'), MatchController.criar)

// PATCH /matches/:id/status — empresa aceita ou rejeita
router.patch('/:id/status', authMiddleware, requireRole('empresa'), MatchController.atualizarStatus)

// DELETE /matches/:id
router.delete('/:id', authMiddleware, MatchController.deletar)

export default router
