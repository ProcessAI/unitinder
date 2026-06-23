import { useEffect, useState } from 'react'
import { Alert } from '@/components/Alert'
import { api, getSession, ApiError } from '@/services/utils/http'

type CandidatoStatus = 'novo' | 'aprovado' | 'recusado'

interface Candidato {
  id: string
  nome: string
  curso: string
  universidade: string
  matchedAt: string
  jobTitle: string
  jobId: string
  status: CandidatoStatus
  proficiencia: 'basico' | 'intermediario' | 'avancado'
  habilidades: string[]
  contactEmail?: string
}

function mapStatusDaApi(status: string): CandidatoStatus {
  if (status === 'ACEITO') return 'aprovado'
  if (status === 'RECUSADO') return 'recusado'
  return 'novo'
}

function mapCandidatoDaApi(m: any, vaga: { id_vaga: number; vaga_titulo: string }): Candidato {
  return {
    id: String(m.id_match),
    nome: m.estagiario?.estagiario_nome_completo ?? 'Candidato',
    curso: m.estagiario?.estagiario_curso ?? '',
    universidade: m.estagiario?.estagiario_instituicao ?? '',
    matchedAt: m.match_data ?? new Date().toISOString(),
    jobTitle: vaga.vaga_titulo,
    jobId: String(vaga.id_vaga),
    status: mapStatusDaApi(m.match_status),
    proficiencia: 'intermediario',
    habilidades: [],
    contactEmail: m.estagiario?.estagiario_email,
  }
}

const STATUS_LABELS: Record<CandidatoStatus, string> = {
  novo: 'Novo',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
}

const STATUS_COLORS: Record<CandidatoStatus, string> = {
  novo: 'bg-blue-50 text-blue-700',
  aprovado: 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
  recusado: 'bg-red-50 text-red-600',
}

const PROFICIENCY_LABELS: Record<string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
      <span className="text-[var(--color-primary-dark)] font-semibold text-sm">
        {initials}
      </span>
    </div>
  )
}

export function Candidatos() {
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<CandidatoStatus | 'todos'>('todos')
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [contatosVisiveis, setContatosVisiveis] = useState<Set<string>>(new Set())

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== 'empresa') return

    async function carregar() {
      try {
        const vagas = await api.listarVagas({ id_empresa_empresa: session!.id })

        const listas = await Promise.all(
          vagas.map(async (vaga) => {
            const matches = await api.listarCandidatosPorVaga(vaga.id_vaga)
            return matches.map((m) => mapCandidatoDaApi(m, vaga))
          })
        )

        setCandidatos(listas.flat())
      } catch (error) {
        setAlerta({
          type: 'error',
          message:
            error instanceof ApiError
              ? error.message
              : 'Não foi possível carregar os candidatos.',
        })
      }
    }

    carregar()
  }, [])

  const candidatosFiltrados = candidatos.filter(
    (c) => filtroStatus === 'todos' || c.status === filtroStatus
  )

  const totalNovos = candidatos.filter((c) => c.status === 'novo').length

  async function alterarStatus(id: string, novoStatus: CandidatoStatus) {
    const labels: Record<CandidatoStatus, string> = {
      aprovado: 'Candidato aprovado com sucesso!',
      recusado: 'Candidato recusado.',
      novo: 'Status atualizado.',
    }

    try {
      await api.atualizarStatusMatch(
        Number(id),
        novoStatus === 'aprovado' ? 'aceito' : 'recusado'
      )

      setCandidatos((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: novoStatus } : c
        )
      )

      setAlerta({
        type: novoStatus === 'aprovado' ? 'success' : 'error',
        message: labels[novoStatus],
      })
    } catch (error) {
      setAlerta({
        type: 'error',
        message:
          error instanceof ApiError
            ? error.message
            : 'Não foi possível atualizar o status do candidato.',
      })
    }
  }

  function toggleContato(id: string) {
    setContatosVisiveis((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {alerta && (
        <Alert
          type={alerta.type}
          message={alerta.message}
          onClose={() => setAlerta(null)}
        />
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Candidatos com Match
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {totalNovos > 0
            ? `${totalNovos} novo${totalNovos > 1 ? 's candidatos aguardam' : ' candidato aguarda'} sua avaliação.`
            : 'Nenhum candidato novo no momento.'}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['todos', 'novo', 'aprovado', 'recusado'] as const).map((opcao) => (
          <button
            key={opcao}
            onClick={() => setFiltroStatus(opcao)}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-medium transition duration-150',
              filtroStatus === opcao
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary-light)]',
            ].join(' ')}
          >
            {opcao === 'todos' ? 'Todos' : STATUS_LABELS[opcao]}
          </button>
        ))}
      </div>

      {candidatosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-[var(--color-text)] font-medium">
            Nenhum candidato encontrado
          </p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
            Quando estudantes derem like nas suas vagas e houver interesse mútuo, eles aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {candidatosFiltrados.map((candidato) => (
            <CandidatoItem
              key={candidato.id}
              candidato={candidato}
              contatoVisivel={contatosVisiveis.has(candidato.id)}
              onToggleContato={() => toggleContato(candidato.id)}
              onAlterarStatus={alterarStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CandidatoItemProps {
  candidato: Candidato
  contatoVisivel: boolean
  onToggleContato: () => void
  onAlterarStatus: (id: string, status: CandidatoStatus) => void
}

function CandidatoItem({
  candidato,
  contatoVisivel,
  onToggleContato,
  onAlterarStatus,
}: CandidatoItemProps) {
  const encerrado = candidato.status === 'aprovado' || candidato.status === 'recusado'

  return (
    <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-4 hover:shadow-sm transition duration-150">
      <div className="flex items-start gap-4">
        <InitialsAvatar name={candidato.nome} />

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <span className="text-base font-semibold text-[var(--color-text)]">
                {candidato.nome}
              </span>
              <p className="text-sm text-[var(--color-text-muted)]">
                {candidato.curso} · {candidato.universidade}
              </p>
            </div>

            <span
              className={[
                'text-xs font-medium px-2.5 py-0.5 rounded-full',
                STATUS_COLORS[candidato.status],
              ].join(' ')}
            >
              {STATUS_LABELS[candidato.status]}
            </span>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            Vaga: {candidato.jobTitle} · Match em {formatDate(candidato.matchedAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[var(--color-text-muted)] font-medium">
          {PROFICIENCY_LABELS[candidato.proficiencia]}:
        </span>
        {candidato.habilidades.map((h) => (
          <span
            key={h}
            className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-md"
          >
            {h}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap border-t border-[var(--color-border)] pt-3">
        <div>
          {contatoVisivel && candidato.contactEmail ? (
            <span className="text-sm text-[var(--color-primary-dark)] font-medium bg-[var(--color-primary-light)] px-3 py-1.5 rounded-lg">
              {candidato.contactEmail}
            </span>
          ) : candidato.contactEmail ? (
            <button
              onClick={onToggleContato}
              className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition duration-150"
            >
              Ver contato do candidato →
            </button>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">
              Contato disponível após aprovação
            </span>
          )}
        </div>

        {!encerrado && (
          <div className="flex gap-2">
            <button
              onClick={() => onAlterarStatus(candidato.id, 'recusado')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition duration-150"
            >
              Recusar
            </button>
            <button
              onClick={() => onAlterarStatus(candidato.id, 'aprovado')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition duration-150"
            >
              Aprovar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}