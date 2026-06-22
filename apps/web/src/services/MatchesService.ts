import { request } from '@/services/utils/http'

export function criarMatch(idEstagiario: number, idVaga: number) {
  return request<any>('/matches', {
    method: 'POST',
    body: JSON.stringify({ id_estagiario_estagiario: idEstagiario, id_vaga_vagas: idVaga }),
  })
}

export function listarMatchesPorEstagiario(idEstagiario: number) {
  return request<any[]>(`/matches/estagiario/${idEstagiario}`)
}

export function listarCandidatosPorVaga(idVaga: number) {
  return request<any[]>(`/matches/vaga/${idVaga}`)
}

export function atualizarStatusMatch(idMatch: number, status: 'aceito' | 'recusado') {
  return request<any>(`/matches/${idMatch}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
