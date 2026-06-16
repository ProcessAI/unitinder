import jwt from 'jsonwebtoken'

export interface AuthTokenPayload {
  id_usuario: number
  role: 'estagiario' | 'empresa'
  id_estagiario?: number
  id_empresa?: number
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET não configurado')
  }
  return secret
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getSecret()) as AuthTokenPayload
}
