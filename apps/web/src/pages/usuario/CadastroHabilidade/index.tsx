import { useState } from 'react'
import { Alert } from '@/components/Alert'
import { criarHabilidade } from '@/services/HabilidadesService'
import { adicionarHabilidadeEstagiario } from '@/services/EstagiarioService'
import { getSession } from '@/services/utils/http'

type FormData = {
  habilidade_nome: string
  habilidade_tipo: string
  habilidade_nivel: string
  habilidade_descricao: string
}

const emptyForm: FormData = {
  habilidade_nome: '',
  habilidade_tipo: '',
  habilidade_nivel: '',
  habilidade_descricao: '',
}

const NIVEL_API: Record<string, string> = {
  basico: 'B',
  intermediario: 'I',
  avancado: 'A',
}

export function CadastroHabilidade() {
  const [alerta, setAlerta] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [enviando, setEnviando] = useState(false)

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setEnviando(true)
    setAlerta(null)

    try {
      const habilidade = await criarHabilidade({
        habilidade_nome: formData.habilidade_nome.trim(),
        habilidade_categoria: formData.habilidade_tipo || undefined,
        habilidade_nivel: NIVEL_API[formData.habilidade_nivel] ?? undefined,
        habilidade_descricao: formData.habilidade_descricao.trim() || undefined,
      })

      const session = getSession()
      if (session?.role === 'estagiario') {
        await adicionarHabilidadeEstagiario(session.id, habilidade.id_habilidade)
      }

      setAlerta({
        type: 'success',
        message: 'Habilidade cadastrada e vinculada ao seu perfil com sucesso!',
      })

      setFormData(emptyForm)
    } catch {
      setAlerta({
        type: 'error',
        message: 'Não foi possível cadastrar a habilidade. Tente novamente.',
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-sm font-semibold text-[var(--color-primary)]">
          Cadastro de habilidade
        </span>

        <h1 className="mt-2 text-2xl font-bold text-[var(--color-text)]">
          Adicione uma habilidade
        </h1>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Cadastre suas habilidades para aumentar suas chances de encontrar vagas compatíveis.
        </p> 
      </div>

      {alerta && (
        <Alert
          type={alerta.type}
          message={alerta.message}
          onClose={() => setAlerta(null)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-sm md:grid-cols-2"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="habilidade_nome" className="text-sm font-medium text-[var(--color-text)]">
            Nome da habilidade
          </label>

          <input
            id="habilidade_nome"
            name="habilidade_nome"
            value={formData.habilidade_nome}
            onChange={handleChange}
            required
            placeholder="Ex: React, Python, Inglês"
            className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="habilidade_tipo" className="text-sm font-medium text-[var(--color-text)]">
            Tipo
          </label>

          <select
            id="habilidade_tipo"
            name="habilidade_tipo"
            value={formData.habilidade_tipo}
            onChange={handleChange}
            required
            className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Selecione um tipo</option>
            <option value="tecnica">Técnica</option>
            <option value="comportamental">Comportamental</option>
            <option value="idioma">Idioma</option>
            <option value="ferramenta">Ferramenta</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="habilidade_nivel" className="text-sm font-medium text-[var(--color-text)]">
            Nível <span className="text-[var(--color-text-muted)] font-normal">(opcional)</span>
          </label>

          <select
            id="habilidade_nivel"
            name="habilidade_nivel"
            value={formData.habilidade_nivel}
            onChange={handleChange}
            className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Definir depois</option>
            <option value="basico">Básico</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="habilidade_descricao" className="text-sm font-medium text-[var(--color-text)]">
            Descrição <span className="text-[var(--color-text-muted)] font-normal">(opcional)</span>
          </label>

          <textarea
            id="habilidade_descricao"
            name="habilidade_descricao"
            value={formData.habilidade_descricao}
            onChange={handleChange}
            rows={4}
            placeholder="Descreva sua experiência com essa habilidade..."
            className="resize-none rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setFormData(emptyForm)}
            className="rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
          >
            Limpar
          </button>

          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
          >
            {enviando ? 'Cadastrando...' : 'Cadastrar habilidade'}
          </button>
        </div>
      </form>
    </div>
  )
}
