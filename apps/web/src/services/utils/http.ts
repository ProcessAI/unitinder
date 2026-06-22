const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export type Role = 'estagiario' | 'empresa'

export interface AuthSession {
  token: string
  role: Role
  id: number
}

const STORAGE_KEY = 'unitinder.auth'

export function saveSession(session: AuthSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  localStorage.setItem('tipoUsuario', session.role)
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem('tipoUsuario')
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getSession()

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(data?.error ?? 'Erro inesperado ao comunicar com o servidor.', response.status)
  }

  return data as T
}

export const api = {
  login: (identificador: string, senha: string) =>
    request<{ token: string; role: Role; empresa?: { id: number; nome: string; cnpj: string }; estagiario?: { id: number; nome: string; email: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ identificador, senha }) }
    ),

  registroEmpresa: (dados: {
    nomeEmpresa: string
    cnpj: string
    email: string
    senha: string
    setor?: string
    cidade?: string
    descricao?: string
  }) =>
    request<{ token: string; role: Role; empresa: { id: number; nome: string; cnpj: string } }>(
      '/auth/registro/empresa',
      { method: 'POST', body: JSON.stringify(dados) }
    ),

    buscarEmpresa: (id: number) =>
  request<any>(`/empresas/${id}`),

atualizarEmpresa: (id: number, dados: {
  nomeEmpresa?: string
  setor?: string
  cidade?: string
  descricao?: string
}) =>
  request<any>(`/empresas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  }),

  registroUsuario: (dados: { nome: string; email: string; senha: string; cpf: string }) =>
    request<{ token: string; role: Role; estagiario: { id: number; nome: string; email: string } }>(
      '/auth/registro/usuario',
      { method: 'POST', body: JSON.stringify(dados) }
    ),

  listarVagas: (filtro?: { id_empresa_empresa?: number }) => {
    const query = filtro?.id_empresa_empresa ? `?id_empresa_empresa=${filtro.id_empresa_empresa}` : ''
    return request<any[]>(`/vagas${query}`)
  },

  criarMatch: (idEstagiario: number, idVaga: number) =>
    request<any>('/matches', {
      method: 'POST',
      body: JSON.stringify({ id_estagiario_estagiario: idEstagiario, id_vaga_vagas: idVaga }),
    }),

  listarMatchesPorEstagiario: (idEstagiario: number) =>
    request<any[]>(`/matches/estagiario/${idEstagiario}`),

  listarCandidatosPorVaga: (idVaga: number) =>
    request<any[]>(`/matches/vaga/${idVaga}`),

  atualizarStatusMatch: (idMatch: number, status: 'aceito' | 'recusado') =>
    request<any>(`/matches/${idMatch}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}
