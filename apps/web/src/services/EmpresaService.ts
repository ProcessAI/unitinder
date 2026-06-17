import { request } from '@/services/utils/http'

export function buscarEmpresa(idEmpresa: number) {
  return request<any>(`/empresas/${idEmpresa}`)
}

export function atualizarEmpresa(idEmpresa: number, dados: Record<string, unknown>) {
  return request<any>(`/empresas/${idEmpresa}`, { method: 'PUT', body: JSON.stringify(dados) })
}
