import { Router } from 'express'
import { MatchController } from '../controllers/match.controller'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', authMiddleware, MatchController.listar)
router.get('/estagiario/:estagiarioId', authMiddleware, MatchController.listarPorEstagiario)
router.get('/vaga/:vagaId', authMiddleware, MatchController.listarPorVaga)
router.get('/:id', authMiddleware, MatchController.buscarPorId)

router.post('/', authMiddleware, requireRole('estagiario'), MatchController.criar)
router.patch('/:id/status', authMiddleware, requireRole('empresa'), MatchController.atualizarStatus)
router.delete('/:id', authMiddleware, MatchController.deletar)

export default router
