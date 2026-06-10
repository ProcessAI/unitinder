import { useState } from 'react'
import { Alert } from '@/components/Alert'

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

export function CadastroHabilidade() {
  const [alerta, setAlerta] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const [formData, setFormData] = useState<FormData>(emptyForm)

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    console.log('Dados da habilidade:', formData)

    setAlerta({
      type: 'success',
      message: 'Habilidade cadastrada com sucesso!',
    })

    setFormData(emptyForm)
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
            Nível
          </label>

          <select
            id="habilidade_nivel"
            name="habilidade_nivel"
            value={formData.habilidade_nivel}
            onChange={handleChange}
            required
            className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Selecione um nível</option>
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
            className="rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
          >
            Cadastrar habilidade
          </button>
        </div>
      </form>
    </div>
  )
}
