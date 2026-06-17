import { request } from '@/services/utils/http'

export function listarVagas(filtro?: { id_empresa_empresa?: number }) {
  const query = filtro?.id_empresa_empresa ? `?id_empresa_empresa=${filtro.id_empresa_empresa}` : ''
  return request<any[]>(`/vagas${query}`)
}

export function buscarVaga(idVaga: number) {
  return request<any>(`/vagas/${idVaga}`)
}

export function criarVaga(dados: Record<string, unknown>) {
  return request<any>('/vagas', { method: 'POST', body: JSON.stringify(dados) })
}

export function atualizarVaga(idVaga: number, dados: Record<string, unknown>) {
  return request<any>(`/vagas/${idVaga}`, { method: 'PUT', body: JSON.stringify(dados) })
}

export function encerrarVaga(idVaga: number) {
  return request<any>(`/vagas/${idVaga}`, { method: 'PUT', body: JSON.stringify({ vaga_status: 'F' }) })
}

export function listarHabilidadesVaga(idVaga: number) {
  return request<any[]>(`/vagas/${idVaga}/habilidades`)
}

export function adicionarHabilidadeVaga(idVaga: number, id_habilidade: number) {
  return request<any>(`/vagas/${idVaga}/habilidades`, { method: 'POST', body: JSON.stringify({ id_habilidade }) })
}

export function removerHabilidadeVaga(idVaga: number, idHabilidade: number) {
  return request<void>(`/vagas/${idVaga}/habilidades/${idHabilidade}`, { method: 'DELETE' })
}
