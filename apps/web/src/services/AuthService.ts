import { request, type Role } from '@/services/utils/http'

export function login(identificador: string, senha: string) {
  return request<{
    token: string
    role: Role
    empresa?: { id: number; nome: string; cnpj: string }
    estagiario?: { id: number; nome: string; email: string }
  }>('/auth/login', { method: 'POST', body: JSON.stringify({ identificador, senha }) })
}

export function registroEmpresa(dados: {
  nomeEmpresa: string
  cnpj: string
  email: string
  senha: string
  setor?: string
  cidade?: string
  descricao?: string
}) {
  return request<{ token: string; role: Role; empresa: { id: number; nome: string; cnpj: string } }>(
    '/auth/registro/empresa',
    { method: 'POST', body: JSON.stringify(dados) }
  )
}

export function registroUsuario(dados: { nome: string; email: string; senha: string; cpf: string }) {
  return request<{ token: string; role: Role; estagiario: { id: number; nome: string; email: string } }>(
    '/auth/registro/usuario',
    { method: 'POST', body: JSON.stringify(dados) }
  )
}
