import { useEffect, useState } from 'react'
import { Alert } from '@/components/Alert'
import { api, getSession, ApiError } from '@/lib/api'

interface VagaFeed {
  id_vaga: number
  vaga_titulo: string
  vaga_descricao?: string
  vaga_area?: string
  vaga_localidade?: string
  vaga_modelo_trabalho?: string
  vaga_status: string
  empresa?: { empresa_nome: string }
}

export function Feed() {
  const [vagas, setVagas] = useState<VagaFeed[]>([])
  const [candidatadas, setCandidatadas] = useState<Set<number>>(new Set())
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    api
      .listarVagas()
      .then((dados) => setVagas(dados.filter((v: VagaFeed) => v.vaga_status === 'A')))
      .catch((error) => {
        setAlerta({
          type: 'error',
          message: error instanceof ApiError ? error.message : 'Não foi possível carregar as vagas.',
        })
      })
  }, [])

  async function handleInteresse(idVaga: number) {
    const session = getSession()

    if (!session || session.role !== 'estagiario') {
      setAlerta({ type: 'error', message: 'Você precisa estar logado como estagiário.' })
      return
    }

    try {
      await api.criarMatch(session.id, idVaga)
      setCandidatadas((prev) => new Set(prev).add(idVaga))
      setAlerta({ type: 'success', message: 'Você demonstrou interesse nesta vaga!' })
    } catch (error) {
      setAlerta({
        type: 'error',
        message: error instanceof ApiError ? error.message : 'Não foi possível registrar seu interesse.',
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {alerta && (
        <Alert type={alerta.type} message={alerta.message} onClose={() => setAlerta(null)} />
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Vagas disponíveis</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Demonstre interesse nas vagas e acompanhe seus matches.
        </p>
      </div>

      {vagas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-[var(--color-text)] font-medium">Nenhuma vaga disponível no momento</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vagas.map((vaga) => {
            const jaCandidatado = candidatadas.has(vaga.id_vaga)

            return (
              <div
                key={vaga.id_vaga}
                className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-base font-semibold text-[var(--color-text)]">
                      {vaga.vaga_titulo}
                    </span>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {vaga.empresa?.empresa_nome} · {vaga.vaga_localidade}
                    </p>
                  </div>

                  <button
                    onClick={() => handleInteresse(vaga.id_vaga)}
                    disabled={jaCandidatado}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition duration-150 disabled:opacity-60"
                  >
                    {jaCandidatado ? 'Interesse enviado' : 'Tenho interesse'}
                  </button>
                </div>

                {vaga.vaga_descricao && (
                  <p className="text-sm text-[var(--color-text)] line-clamp-3">{vaga.vaga_descricao}</p>
                )}

                <div className="flex gap-2 flex-wrap">
                  {vaga.vaga_area && (
                    <span className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-md">
                      {vaga.vaga_area}
                    </span>
                  )}
                  {vaga.vaga_modelo_trabalho && (
                    <span className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-md">
                      {vaga.vaga_modelo_trabalho}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
