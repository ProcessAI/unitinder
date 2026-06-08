import { useState } from 'react'
import { Alert } from '@/components/Alert'

const SKILLS = [
  'Comunicação', 'Docker', 'Figma', 'Git', 'HTML/CSS',
  'Inglês', 'Java', 'JavaScript', 'Node.js', 'Proatividade',
  'Python', 'React', 'SQL', 'Trabalho em equipe', 'TypeScript', 'UX/UI Design',
]

const WORK_MODELS = ['Presencial', 'Remoto', 'Híbrido']

interface Vaga {
  id: string
  titulo: string
  descricao: string
  area: string
  localidade: string
  modelo: string
  salarioMin: string
  salarioMax: string
  cargaHoraria: string
  beneficios: string
  habilidades: string[]
  matches: number
}

interface FormData {
  titulo: string
  descricao: string
  area: string
  localidade: string
  modelo: string
  salarioMin: string
  salarioMax: string
  cargaHoraria: string
  beneficios: string
  habilidades: string[]
}

const emptyForm: FormData = {
  titulo: '',
  descricao: '',
  area: '',
  localidade: '',
  modelo: 'Presencial',
  salarioMin: '',
  salarioMax: '',
  cargaHoraria: '30h',
  beneficios: '',
  habilidades: [],
}

export function MinhasVagas() {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function toggleHabilidade(skill: string) {
    setForm(prev => ({
      ...prev,
      habilidades: prev.habilidades.includes(skill)
        ? prev.habilidades.filter(s => s !== skill)
        : [...prev.habilidades, skill],
    }))
  }

  function handlePublicar() {
    if (!form.titulo.trim()) {
      setAlert({ type: 'error', message: 'O título é obrigatório.' })
      return
    }

    const nova: Vaga = {
      id: crypto.randomUUID(),
      titulo: form.titulo,
      descricao: form.descricao,
      area: form.area,
      localidade: form.localidade,
      modelo: form.modelo,
      salarioMin: form.salarioMin,
      salarioMax: form.salarioMax,
      cargaHoraria: form.cargaHoraria,
      beneficios: form.beneficios,
      habilidades: form.habilidades,
      matches: 0,
    }

    setVagas(prev => [nova, ...prev])
    setForm(emptyForm)
    setShowModal(false)
    setAlert({ type: 'success', message: 'Vaga publicada!' })
    setTimeout(() => setAlert(null), 4000)
  }

  function handleExcluir(id: string) {
    setVagas(prev => prev.filter(v => v.id !== id))
  }

  return (
    <div className="relative">
      {alert && (
        <div className="fixed top-4 right-4 z-50 w-80">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Minhas vagas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[var(--color-text)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Nova vaga
        </button>
      </div>

      {vagas.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-sm">Nenhuma vaga criada ainda.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {vagas.map(vaga => (
            <div key={vaga.id} className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="font-semibold text-[var(--color-text)]">{vaga.titulo}</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                    {[vaga.area, vaga.modelo, vaga.cargaHoraria].filter(Boolean).join(' • ')}
                  </p>
                  {vaga.descricao && (
                    <p className="text-sm text-[var(--color-text)] mt-2">{vaga.descricao}</p>
                  )}
                </div>
                <button
                  onClick={() => handleExcluir(vaga.id)}
                  className="text-[var(--color-error)] text-sm font-medium hover:opacity-80 transition-opacity ml-4 shrink-0"
                >
                  Excluir
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  🤝 Quem deu match ({vaga.matches})
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">Nenhum estagiário curtiu ainda.</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/30 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-4 p-8">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Nova vaga</h2>

            <div className="flex flex-col gap-5">
              <Field label="Título">
                <input
                  type="text"
                  value={form.titulo}
                  onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                  className={inputClass}
                />
              </Field>

              <Field label="Descrição">
                <textarea
                  value={form.descricao}
                  onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  rows={5}
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Área">
                  <input
                    type="text"
                    value={form.area}
                    onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Localidade">
                  <input
                    type="text"
                    value={form.localidade}
                    onChange={e => setForm(p => ({ ...p, localidade: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Modelo">
                <select
                  value={form.modelo}
                  onChange={e => setForm(p => ({ ...p, modelo: e.target.value }))}
                  className={inputClass}
                >
                  {WORK_MODELS.map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Salário mín (R$)">
                  <input
                    type="number"
                    value={form.salarioMin}
                    onChange={e => setForm(p => ({ ...p, salarioMin: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Salário máx (R$)">
                  <input
                    type="number"
                    value={form.salarioMax}
                    onChange={e => setForm(p => ({ ...p, salarioMax: e.target.value }))}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Carga horária">
                <input
                  type="text"
                  value={form.cargaHoraria}
                  onChange={e => setForm(p => ({ ...p, cargaHoraria: e.target.value }))}
                  className={inputClass}
                />
              </Field>

              <Field label="Benefícios">
                <textarea
                  value={form.beneficios}
                  onChange={e => setForm(p => ({ ...p, beneficios: e.target.value }))}
                  rows={4}
                  className={inputClass}
                />
              </Field>

              <div>
                <p className="text-sm font-medium text-[var(--color-text)] mb-3">Habilidades</p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(skill => {
                    const selected = form.habilidades.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleHabilidade(skill)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          selected
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                            : 'bg-white border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
                        }`}
                      >
                        {skill}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">Selecione e salve o formulário.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => { setShowModal(false); setForm(emptyForm) }}
                className="px-5 py-2 rounded-lg text-sm font-medium text-[var(--color-text)] border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublicar}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-[var(--color-text)] text-white hover:opacity-90 transition-opacity"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputClass = 'w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)] bg-white focus:outline-none focus:border-[var(--color-primary)] transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
      {children}
    </div>
  )
}
