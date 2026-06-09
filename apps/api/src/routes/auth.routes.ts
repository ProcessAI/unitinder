import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'

const router = Router()

// POST /auth/login
router.post('/login', AuthController.login)

// POST /auth/registro/usuario
router.post('/registro/usuario', AuthController.registroUsuario)

// POST /auth/registro/empresa
router.post('/registro/empresa', AuthController.registroEmpresa)

export default router
