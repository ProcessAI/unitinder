import { useEffect, useState } from 'react'
import { listarVagas } from '@/services/VagasService'
import { criarMatch } from '@/services/MatchesService'
import { getSession, ApiError } from '@/services/utils/http'
import { Alert } from '@/components/Alert'

interface FeedVaga {
  id: string
  area: string
  title: string
  tags: string[]
  company: string
  salary: string
  skills: string[]
}

const STORAGE_KEY = 'vagas_vistas'

export function Feed() {
  const [vagas, setVagas] = useState<FeedVaga[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [enviandoLike, setEnviandoLike] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // 👇 carrega vagas vistas do localStorage
  const [vistas, setVistas] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  const salvarVistas = (novoSet: Set<string>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...novoSet]))
  }

  const marcarComoVista = (id: string) => {
    setVistas(prev => {
      const novo = new Set(prev)
      novo.add(id)
      salvarVistas(novo)
      return novo
    })
  }

  useEffect(() => {
    async function carregarVagas() {
      try {
        const lista = await listarVagas()

        const vistasLocal = new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

        const vagasFormatadas: FeedVaga[] = lista
          .map((v: any) => ({
            id: String(v.id_vaga),
            area: v.vaga_area ?? '',
            title: v.vaga_titulo ?? '',
            tags: [
              v.vaga_tipo_contrato,
              v.vaga_modelo_trabalho,
              v.vaga_nivel,
            ].filter(Boolean),
            company: v.empresa?.empresa_nome ?? 'Empresa',
            salary:
              v.vaga_salario_min || v.vaga_salario_max
                ? `R$ ${v.vaga_salario_min ?? 0} – R$ ${v.vaga_salario_max ?? 0}`
                : 'Salário a combinar',
            skills: Array.isArray(v.habilidades)
              ? v.habilidades.map(
                  (h: any) =>
                    h.habilidade?.habilidade_nome ?? h.habilidade_nome
                )
              : [],
          }))
          // 🔥 remove duplicadas e já vistas
          .filter(vaga => !vistasLocal.has(vaga.id))

        setVagas(vagasFormatadas)
      } catch (error) {
        console.error('Erro ao carregar vagas:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarVagas()
  }, [])

  const handleNext = () => {
    const vagaAtual = vagas[currentIndex]

    if (vagaAtual) {
      marcarComoVista(vagaAtual.id)
    }

    setCurrentIndex(prev => prev + 1)
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleLike = async (vagaId: string) => {
    const session = getSession()

    if (!session || session.role !== 'estagiario') {
      setAlert({
        type: 'error',
        message: 'Você precisa estar logado como estagiário para curtir vagas.'
      })
      setTimeout(() => setAlert(null), 4000)
      return
    }

    setEnviandoLike(true)

    try {
      await criarMatch(Number(session.id), Number(vagaId))

      marcarComoVista(vagaId)
      handleNext()
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof ApiError ? error.message : 'Erro ao curtir vaga',
      })
      setTimeout(() => setAlert(null), 3000)
    } finally {
      setEnviandoLike(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <p className="text-[var(--color-text-muted)]">
          Carregando vagas...
        </p>
      </div>
    )
  }

  const isFinished = currentIndex >= vagas.length

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Sem mais vagas por agora 🎉
        </h2>

        <p className="text-[var(--color-text-muted)] text-base">
          Volte mais tarde para conferir novas oportunidades.
        </p>
      </div>
    )
  }

  const currentVaga = vagas[currentIndex]

  return (
    <div className="flex flex-col items-center py-12 px-4 min-h-[calc(100vh-80px)] bg-[var(--color-bg)]">

      {alert && (
        <div className="fixed top-4 right-4 z-50 w-80">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="w-full max-w-xl bg-[var(--color-white)] border border-[var(--color-border)] rounded-2xl shadow-sm p-8">

        <div className="mb-6">
          <span className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            {currentVaga.area}
          </span>

          <h2 className="text-3xl font-bold text-[var(--color-text)] mt-2 mb-4">
            {currentVaga.title}
          </h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {currentVaga.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-3 py-1 rounded-md text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-base text-[var(--color-text)] mb-2">
            {currentVaga.company}
          </p>

          <p className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>💰</span>
            {currentVaga.salary}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3">
            Habilidades
          </h3>

          <div className="flex flex-wrap gap-2">
            {currentVaga.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-[var(--color-white)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-1.5 rounded-full text-sm font-medium shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-8">

        <button
          onClick={handleSkip}
          disabled={enviandoLike}
          className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-[#2C3E50] text-[#2C3E50] hover:bg-gray-100 transition duration-150 disabled:opacity-50"
          aria-label="Pular vaga"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <button
          onClick={() => handleLike(currentVaga.id)}
          disabled={enviandoLike}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-[#ED7D63] text-white hover:bg-[#d96a50] transition duration-150 shadow-md disabled:opacity-50"
          aria-label="Curtir vaga"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="mt-4 text-[var(--color-text-muted)] text-sm font-medium">
        {currentIndex + 1} / {vagas.length}
      </div>
    </div>
  )
}