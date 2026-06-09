import { Router } from 'express'
import { MatchController } from '../controllers/match.controller'

const router = Router()

// GET /matches
router.get('/', MatchController.listar)

// GET /matches/:id
router.get('/:id', MatchController.buscarPorId)

// GET /matches/estagiario/:estagiarioId — matches de um estagiário
router.get('/estagiario/:estagiarioId', MatchController.listarPorEstagiario)

// GET /matches/vaga/:vagaId — candidatos de uma vaga
router.get('/vaga/:vagaId', MatchController.listarPorVaga)

// POST /matches — estagiário aplica para uma vaga
router.post('/', MatchController.criar)

// PATCH /matches/:id/status — empresa aceita ou rejeita
router.patch('/:id/status', MatchController.atualizarStatus)

// DELETE /matches/:id
router.delete('/:id', MatchController.deletar)

export default router
