import { useEffect, useState } from 'react'
import { Alert } from '@/components/Alert'
import { api, getSession, ApiError } from '@/services/utils/http'

type MatchStatus = 'ativo' | 'encerrado'

interface MatchCard {
  id: string
  jobId: string
  jobTitle: string
  companyName: string
  location: string
  matchedAt: string
  status: MatchStatus
  proficiencyRequired: 'basico' | 'intermediario' | 'avancado'
  contactEmail?: string
}

function mapMatchDaApi(m: any): MatchCard {
  const recusado = m.match_status === 'RECUSADO'
  const aceito = m.match_status === 'ACEITO'
  return {
    id: String(m.id_match),
    jobId: String(m.vaga?.id_vaga ?? ''),
    jobTitle: m.vaga?.vaga_titulo ?? 'Vaga',
    companyName: m.vaga?.empresa?.empresa_nome ?? 'Empresa',
    location: m.vaga?.vaga_localidade ?? '',
    matchedAt: m.match_data ?? new Date().toISOString(),
    status: recusado ? 'encerrado' : 'ativo',
    proficiencyRequired: 'intermediario',
    contactEmail: aceito ? m.vaga?.empresa?.usuarios?.[0]?.usuario_email : undefined,
  }
}

const PROFICIENCY_LABELS: Record<string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

const PROFICIENCY_COLORS: Record<string, string> = {
  basico: 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
  intermediario: 'bg-blue-50 text-blue-700',
  avancado: 'bg-purple-50 text-purple-700',
}

function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="w-14 h-14 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
      <span className="text-[var(--color-primary-dark)] font-semibold text-base">
        {initials}
      </span>
    </div>
  )
}

export function Matches() {
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'ativo' | 'encerrado'>('todos')
  const [matches, setMatches] = useState<MatchCard[]>([])

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== 'estagiario') return

    api
      .listarMatchesPorEstagiario(session.id)
      .then((dados) => setMatches(dados.map(mapMatchDaApi)))
      .catch((error) => {
        setAlerta({
          type: 'error',
          message: error instanceof ApiError ? error.message : 'Não foi possível carregar seus matches.',
        })
      })
  }, [])

  const matchesFiltrados = matches.filter(
    (m) => filtro === 'todos' || m.status === filtro
  )

  const totalAtivos = matches.filter((m) => m.status === 'ativo').length

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
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Seus Matches</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {totalAtivos > 0
            ? `Você tem ${totalAtivos} match${totalAtivos > 1 ? 'es ativos' : ' ativo'}. Entre em contato com as empresas!`
            : 'Continue explorando vagas no Feed para conseguir novos matches.'}
        </p>
      </div>

      <div className="flex gap-2">
        {(['todos', 'ativo', 'encerrado'] as const).map((opcao) => (
          <button
            key={opcao}
            onClick={() => setFiltro(opcao)}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-medium transition duration-150',
              filtro === opcao
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary-light)]',
            ].join(' ')}
          >
            {opcao === 'todos' ? 'Todos' : opcao === 'ativo' ? 'Ativos' : 'Encerrados'}
          </button>
        ))}
      </div>

      {matchesFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-[var(--color-text)] font-medium">Nenhum match encontrado</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
            Volte ao Feed e dê likes nas vagas que te interessam para gerar novos matches.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matchesFiltrados.map((match) => (
            <MatchItem
              key={match.id}
              match={match}
              onAlerta={setAlerta}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface MatchItemProps {
  match: MatchCard
  onAlerta: (alerta: { type: 'success' | 'error'; message: string } | null) => void
}

function MatchItem({ match, onAlerta }: MatchItemProps) {
  const [contatoVisivel, setContatoVisivel] = useState(false)
  const encerrado = match.status === 'encerrado'

  function handleVerContato() {
    if (!match.contactEmail) {
      onAlerta({ type: 'error', message: 'Esta vaga não está mais disponível.' })
      return
    }
    setContatoVisivel((v) => !v)
  }

  return (
    <div
      className={[
        'bg-[var(--color-white)] border border-[var(--color-border)] rounded-xl p-5 flex gap-4 transition duration-150',
        encerrado ? 'opacity-60' : 'hover:shadow-sm',
      ].join(' ')}
    >
      <InitialsAvatar name={match.companyName} />

      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold text-[var(--color-text)] leading-tight">
              {match.jobTitle}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">
              {match.companyName} · {match.location}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={[
                'text-xs font-medium px-2.5 py-0.5 rounded-full',
                PROFICIENCY_COLORS[match.proficiencyRequired],
              ].join(' ')}
            >
              {PROFICIENCY_LABELS[match.proficiencyRequired]}
            </span>

            <span
              className={[
                'text-xs font-medium px-2.5 py-0.5 rounded-full',
                encerrado
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
              ].join(' ')}
            >
              {encerrado ? 'Encerrado' : 'Match'}
            </span>
          </div>
        </div>

        <span className="text-xs text-[var(--color-text-muted)]">
          Match em {formatMatchDate(match.matchedAt)}
        </span>

        {!encerrado && (
          <div className="mt-1">
            {contatoVisivel && match.contactEmail ? (
              <div className="flex items-center gap-2 bg-[var(--color-primary-light)] rounded-lg px-3 py-2 text-sm text-[var(--color-primary-dark)] font-medium">
                <span>{match.contactEmail}</span>
              </div>
            ) : (
              <button
                onClick={handleVerContato}
                className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition duration-150"
              >
                Ver contato da empresa →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
