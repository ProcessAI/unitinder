import { Router } from 'express'
import { EmpresaController } from '../controllers/empresa.controller'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// ─── Cadastro ────────────────────────────────────────────────────────────────

// POST /empresas/cadastro
router.post('/cadastro', EmpresaController.cadastrar)

// ─── Perfil ──────────────────────────────────────────────────────────────────

// GET  /empresas/:id/perfil
router.get('/:id/perfil', authMiddleware, requireRole('empresa'), EmpresaController.verPerfil)

// PUT  /empresas/:id/perfil
router.put('/:id/perfil', authMiddleware, requireRole('empresa'), EmpresaController.atualizarPerfil)

// ─── Minhas Vagas ────────────────────────────────────────────────────────────

// GET  /empresas/:id/vagas
router.get('/:id/vagas', authMiddleware, requireRole('empresa'), EmpresaController.listarVagas)

// ─── Candidatos ──────────────────────────────────────────────────────────────

// GET  /empresas/:id/candidatos
router.get('/:id/candidatos', authMiddleware, requireRole('empresa'), EmpresaController.listarCandidatos)

// ─── Rotas gerais ────────────────────────────────────────────────────────────

// GET  /empresas
router.get('/', EmpresaController.listar)

// GET  /empresas/:id
router.get('/:id', EmpresaController.buscarPorId)

// PUT  /empresas/:id
router.put('/:id', authMiddleware, requireRole('empresa'), EmpresaController.atualizar)

// DELETE /empresas/:id
router.delete('/:id', authMiddleware, requireRole('empresa'), EmpresaController.deletar)

export default router
