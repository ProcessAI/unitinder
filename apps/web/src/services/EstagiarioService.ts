import { request } from '@/services/utils/http'

export function buscarEstagiario(idEstagiario: number) {
  return request<any>(`/estagiarios/${idEstagiario}`)
}

export function atualizarEstagiario(idEstagiario: number, dados: Record<string, unknown>) {
  return request<any>(`/estagiarios/${idEstagiario}`, { method: 'PUT', body: JSON.stringify(dados) })
}
