import { request } from '@/services/utils/http'

export function listarHabilidades() {
  return request<any[]>('/habilidades')
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
