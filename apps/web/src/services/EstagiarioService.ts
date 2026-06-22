import { request } from '@/services/utils/http'

// ── Tipos ─────────────────────────────────────────────────────────────────
// Espelham o model Estagiario do schema.prisma.

export interface Estagiario {
  id_estagiario: number
  estagiario_email: string
  estagiario_nome_completo: string
  estagiario_cpf: string
  estagiario_data_nascimento: string | null
  estagiario_telefone: string | null
  estagiario_foto_perfil_url: string | null
  estagiario_cidade: string | null
  estagiario_estado: string | null
  estagiario_disponivel_remoto: boolean | null
  estagiario_instituicao: string | null
  estagiario_curso: string | null
  estagiario_semestre_atual: number | null
  estagiario_previsao_formatura: string | null
  estagiario_turno: string | null
  estagiario_area_interesse: string | null
  estagiario_nivel_experiencia: string | null
  estagiario_cv_url: string | null
  estagiario_linkedin_url: string | null
  estagiario_portfolio_url: string | null
  estagiario_bio: string | null
  estagiario_modalidade_preferida: string | null
  estagiario_carga_horaria_preferida: number | null
  estagiario_aceita_bolsa_minima: boolean | null
  estagiario_ativo: boolean
  estagiario_perfil_completo: boolean
  estagiario_created_at: string
  estagiario_updated_at: string
}

export type EstagiarioResumo = Omit<
  Estagiario,
  | 'estagiario_cpf'
  | 'estagiario_data_nascimento'
  | 'estagiario_telefone'
  | 'estagiario_previsao_formatura'
  | 'estagiario_ativo'
  | 'estagiario_updated_at'
>

export type AtualizarEstagiarioPayload = Partial<
  Omit<
    Estagiario,
    'id_estagiario' | 'estagiario_email' | 'estagiario_cpf' | 'estagiario_ativo' | 'estagiario_created_at' | 'estagiario_updated_at'
  >
>

// Espelha model Habilidade do schema.prisma
export interface Habilidade {
  id_habilidade: number
  habilidade_nome: string
  habilidade_categoria: string | null
  habilidade_nivel: string | null // 'B' | 'I' | 'A'
  habilidade_descricao: string | null
}

// Espelha model RlEstagiarioHabilidade, com a habilidade resolvida via include
export interface VinculoHabilidade {
  id_estagiario_habilidade: number
  id_estagiario: number
  id_habilidade: number
  habilidade: Habilidade
}

// ── Requisições ───────────────────────────────────────────────────────────

// GET /estagiarios
export function listarEstagiarios() {
  return request<EstagiarioResumo[]>('/estagiarios')
}

// GET /estagiarios/:id
export function buscarEstagiario(idEstagiario: number) {
  return request<Estagiario>(`/estagiarios/${idEstagiario}`)
}

// PUT /estagiarios/:id
export function atualizarEstagiario(idEstagiario: number, dados: AtualizarEstagiarioPayload) {
  return request<{ message: string; estagiario: Estagiario }>(`/estagiarios/${idEstagiario}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

// DELETE /estagiarios/:id — soft delete (desativa a conta, RN-04)
export function desativarEstagiario(idEstagiario: number) {
  return request<{ message: string }>(`/estagiarios/${idEstagiario}`, { method: 'DELETE' })
}

// GET /estagiarios/:id/habilidades
export function listarHabilidadesEstagiario(idEstagiario: number) {
  return request<VinculoHabilidade[]>(`/estagiarios/${idEstagiario}/habilidades`)
}

// POST /estagiarios/:id/habilidades
export function adicionarHabilidadeEstagiario(idEstagiario: number, idHabilidade: number) {
  return request<{ message: string; vinculo: VinculoHabilidade }>(`/estagiarios/${idEstagiario}/habilidades`, {
    method: 'POST',
    body: JSON.stringify({ id_habilidade: idHabilidade }),
  })
}

// DELETE /estagiarios/:id/habilidades/:habilidadeId
export function removerHabilidadeEstagiario(idEstagiario: number, idHabilidade: number) {
  return request<void>(`/estagiarios/${idEstagiario}/habilidades/${idHabilidade}`, { method: 'DELETE' })
}