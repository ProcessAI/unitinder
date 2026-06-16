import { Request, Response, NextFunction } from 'express'
import { verifyAuthToken, AuthTokenPayload } from '../utils/jwt'

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não informado' })
  }

  const token = header.slice('Bearer '.length)

  try {
    req.auth = verifyAuthToken(token)
    return next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export function requireRole(role: 'estagiario' | 'empresa') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.auth?.role !== role) {
      return res.status(403).json({ error: 'Acesso não permitido para este perfil' })
    }
    return next()
  }
}
