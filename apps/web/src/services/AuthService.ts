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

export interface RegistroUsuarioPayload {
  nome: string
  email: string
  senha: string
  cpf: string
  data_nascimento?: string
  telefone?: string
  foto_perfil_url?: string
  cidade?: string
  estado?: string
  disponivel_remoto?: boolean
  instituicao?: string
  curso?: string
  semestre_atual?: number
  previsao_formatura?: string
  turno?: string
  area_interesse?: string
  nivel_experiencia?: string
  modalidade_preferida?: string
  carga_horaria_preferida?: number
  aceita_bolsa_minima?: boolean
  cv_url?: string
  linkedin_url?: string
  portfolio_url?: string
  bio?: string
  habilidades?: string[]
}

export function registroUsuario(dados: RegistroUsuarioPayload) {
  return request<{ token: string; role: Role; estagiario: { id: number; nome: string; email: string } }>(
    '/auth/registro/usuario',
    { method: 'POST', body: JSON.stringify(dados) }
  )
}
