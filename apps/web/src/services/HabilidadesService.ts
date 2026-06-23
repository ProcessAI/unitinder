import { request } from '@/services/utils/http'

export interface Habilidade {
  id_habilidade: number
  habilidade_nome: string
  habilidade_categoria: string | null
  habilidade_nivel: string | null
  habilidade_descricao: string | null
}

export interface CriarHabilidadePayload {
  habilidade_nome: string
  habilidade_categoria?: string
  habilidade_nivel?: string
  habilidade_descricao?: string
}

export function listarHabilidades() {
  return request<Habilidade[]>('/habilidades')
}

export function criarHabilidade(dados: CriarHabilidadePayload) {
  return request<Habilidade>('/habilidades', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function listarHabilidadesEstagiario(idEstagiario: number) {
  return request<any[]>(`/estagiarios/${idEstagiario}/habilidades`)
}

export function adicionarHabilidadeEstagiario(idEstagiario: number, idHabilidade: number) {
  return request<any>(`/estagiarios/${idEstagiario}/habilidades`, {
    method: 'POST',
    body: JSON.stringify({ id_habilidade: idHabilidade }),
  })
}

export function removerHabilidadeEstagiario(idEstagiario: number, idHabilidade: number) {
  return request<void>(`/estagiarios/${idEstagiario}/habilidades/${idHabilidade}`, { method: 'DELETE' })
}
