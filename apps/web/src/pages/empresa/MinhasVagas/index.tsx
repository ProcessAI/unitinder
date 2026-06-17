import { useEffect, useState } from 'react'
import { Alert } from '@/components/Alert'
import { getSession, ApiError } from '@/services/utils/http'
import { listarVagas, criarVaga, atualizarVaga, encerrarVaga, adicionarHabilidadeVaga } from '@/services/VagasService'
import { listarHabilidades } from '@/services/HabilidadesService'
import { listarCandidatosPorVaga } from '@/services/MatchesService'

const SKILLS_FALLBACK = [
  'Comunicação', 'Docker', 'Figma', 'Git', 'HTML/CSS',
  'Inglês', 'Java', 'JavaScript', 'Node.js', 'Proatividade',
  'Python', 'React', 'SQL', 'Trabalho em equipe', 'TypeScript', 'UX/UI Design',
]

const WORK_MODELS = ['Presencial', 'Híbrido', 'Remoto']
const CONTRACT_TYPES = ['CLT', 'PJ', 'Estágio', 'Temporário']
const LEVELS = ['Júnior', 'Pleno', 'Sênior']
const EDUCATION_LEVELS = ['Médio', 'Técnico', 'Superior']

interface Vaga {
  id: string
  titulo: string
  descricao: string
  area: string
  localidade: string
  modelo: string
  tipoContrato: string
  nivel: string
  salarioMin: string
  salarioMax: string
  quantidadeVagas: string
  prazoCandidatura: string
  beneficios: string
  cargaHoraria: string
  horarioTrabalho: string
  escolaridade: string
  experienciaMinima: string
  pcd: string
  habilidades: string[]
  status: 'Ativa' | 'Inativa'
  dataPublicacao: string
  dataAtualizacao: string
  matches: number
}

interface FormData {
  titulo: string
  descricao: string
  area: string
  localidade: string
  modelo: string
  tipoContrato: string
  nivel: string
  salarioMin: string
  salarioMax: string
  quantidadeVagas: string
  prazoCandidatura: string
  beneficios: string
  cargaHoraria: string
  horarioTrabalho: string
  escolaridade: string
  experienciaMinima: string
  pcd: string
  habilidades: string[]
}

const emptyForm: FormData = {
  titulo: '',
  descricao: '',
  area: '',
  localidade: '',
  modelo: 'Presencial',
  tipoContrato: 'Estágio',
  nivel: 'Júnior',
  salarioMin: '',
  salarioMax: '',
  quantidadeVagas: '',
  prazoCandidatura: '',
  beneficios: '',
  cargaHoraria: '',
  horarioTrabalho: '',
  escolaridade: '',
  experienciaMinima: '',
  pcd: 'Não',
  habilidades: [],
}

type FormErrors = Partial<Record<keyof FormData, string>>

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {}

  if (!form.titulo.trim()) {
    errors.titulo = 'Obrigatório.'
  } else if (form.titulo.trim().length < 5) {
    errors.titulo = 'Mínimo 5 caracteres.'
  } else if (form.titulo.trim().length > 100) {
    errors.titulo = 'Máximo 100 caracteres.'
  }

  if (!form.descricao.trim()) {
    errors.descricao = 'Obrigatório.'
  } else if (form.descricao.trim().length < 300) {
    errors.descricao = `Mínimo 300 caracteres. (${form.descricao.trim().length}/300)`
  } else if (form.descricao.trim().length > 2000) {
    errors.descricao = `Máximo 2000 caracteres. (${form.descricao.trim().length}/2000)`
  }

  if (!form.area.trim()) errors.area = 'Obrigatório.'
  if (!form.localidade.trim()) errors.localidade = 'Obrigatório.'

  if (!form.quantidadeVagas || parseInt(form.quantidadeVagas) < 1) {
    errors.quantidadeVagas = 'Informe um número inteiro maior que 0.'
  }

  if (form.salarioMin && form.salarioMax) {
    if (parseFloat(form.salarioMin) > parseFloat(form.salarioMax)) {
      errors.salarioMin = 'O salário mínimo não pode ser maior que o máximo.'
    }
  }

  return errors
}

function mapVagaDaApi(v: any): Vaga {
  const habilidades: string[] = Array.isArray(v.habilidades)
    ? v.habilidades.map((h: any) => h.habilidade?.habilidade_nome ?? h.habilidade_nome ?? '')
    : []

  return {
    id: String(v.id_vaga),
    titulo: v.vaga_titulo ?? '',
    descricao: v.vaga_descricao ?? '',
    area: v.vaga_area ?? '',
    localidade: v.vaga_localidade ?? '',
    modelo: v.vaga_modelo_trabalho ?? '',
    tipoContrato: v.vaga_tipo_contrato ?? '',
    nivel: v.vaga_nivel ?? '',
    salarioMin: v.vaga_salario_min !== null && v.vaga_salario_min !== undefined ? String(v.vaga_salario_min) : '',
    salarioMax: v.vaga_salario_max !== null && v.vaga_salario_max !== undefined ? String(v.vaga_salario_max) : '',
    quantidadeVagas: v.vaga_qtd_vagas !== null && v.vaga_qtd_vagas !== undefined ? String(v.vaga_qtd_vagas) : '',
    prazoCandidatura: v.vaga_prazo_candidatura ? String(v.vaga_prazo_candidatura).slice(0, 10) : '',
    beneficios: v.vaga_beneficios ?? '',
    cargaHoraria: v.vaga_carga_horaria ?? '',
    horarioTrabalho: '',
    escolaridade: v.vaga_escolaridade_minima ?? '',
    experienciaMinima: v.vaga_experiencia_minima ?? '',
    pcd: v.vaga_pcd ? 'Sim' : 'Não',
    habilidades,
    status: v.vaga_status === 'A' ? 'Ativa' : 'Inativa',
    dataPublicacao: v.vaga_created_at ?? new Date().toISOString(),
    dataAtualizacao: v.vaga_updated_at ?? new Date().toISOString(),
    matches: 0,
  }
}

export function MinhasVagas() {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [habilidadesDisponiveis, setHabilidadesDisponiveis] = useState<{ id: number; nome: string }[]>([])
  const [showModal, setShowModal] = useState(false)
  const [vagaEditando, setVagaEditando] = useState<Vaga | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [publicando, setPublicando] = useState(false)

  useEffect(() => {
    listarHabilidades()
      .then((lista) => setHabilidadesDisponiveis(lista.map((h: any) => ({ id: h.id_habilidade, nome: h.habilidade_nome }))))
      .catch(() => setHabilidadesDisponiveis(SKILLS_FALLBACK.map((nome, i) => ({ id: -(i + 1), nome }))))
  }, [])

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== 'empresa') return

    async function carregar() {
      try {
        const vagasApi = await listarVagas({ id_empresa_empresa: session!.id })
        const vagasMapeadas = vagasApi.map(mapVagaDaApi)

        const contagens = await Promise.all(
          vagasMapeadas.map((v) => listarCandidatosPorVaga(Number(v.id)).then((c) => c.length).catch(() => 0))
        )

        setVagas(vagasMapeadas.map((v, index) => ({ ...v, matches: contagens[index] })))
      } catch (error) {
        setAlert({
          type: 'error',
          message: error instanceof ApiError ? error.message : 'Não foi possível carregar as vagas.',
        })
      }
    }

    carregar()
  }, [])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function toggleHabilidade(skill: string) {
    setForm(prev => ({
      ...prev,
      habilidades: prev.habilidades.includes(skill)
        ? prev.habilidades.filter(s => s !== skill)
        : [...prev.habilidades, skill],
    }))
  }

  async function handlePublicar() {
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setAlert({ type: 'error', message: 'Corrija os erros antes de publicar.' })
      setTimeout(() => setAlert(null), 4000)
      return
    }

    const session = getSession()
    if (!session) {
      setAlert({ type: 'error', message: 'Você precisa estar logado como empresa para publicar.' })
      return
    }

    const idEmpresa = session.id
    setPublicando(true)

    try {
      const vagaCriada = await criarVaga({
        id_empresa_empresa: idEmpresa,
        vaga_titulo: form.titulo,
        vaga_descricao: form.descricao,
        vaga_area: form.area,
        vaga_localidade: form.localidade,
        vaga_modelo_trabalho: form.modelo,
        vaga_tipo_contrato: form.tipoContrato,
        vaga_nivel: form.nivel,
        vaga_qtd_vagas: Number(form.quantidadeVagas),
        vaga_pcd: form.pcd === 'Sim',
        vaga_salario_min: form.salarioMin ? Number(form.salarioMin) : undefined,
        vaga_salario_max: form.salarioMax ? Number(form.salarioMax) : undefined,
        vaga_beneficios: form.beneficios,
        vaga_carga_horaria: form.cargaHoraria,
        vaga_escolaridade_minima: form.escolaridade,
        vaga_experiencia_minima: form.experienciaMinima,
        vaga_prazo_candidatura: form.prazoCandidatura || undefined,
      })

      const idVaga = vagaCriada.id_vaga
      if (form.habilidades.length > 0) {
        await Promise.allSettled(
          form.habilidades.map((nome) => {
            const habilidade = habilidadesDisponiveis.find((h) => h.nome === nome)
            if (habilidade && habilidade.id > 0) {
              return adicionarHabilidadeVaga(idVaga, habilidade.id)
            }
          })
        )
      }

      const vagaComHabilidades = await listarVagas({ id_empresa_empresa: session.id })
        .then((lista) => lista.find((v: any) => v.id_vaga === idVaga))
        .catch(() => vagaCriada)

      setVagas(prev => [mapVagaDaApi(vagaComHabilidades ?? vagaCriada), ...prev])
      setForm(emptyForm)
      setErrors({})
      setShowModal(false)
      setAlert({ type: 'success', message: 'Vaga publicada!' })
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof ApiError ? error.message : 'Não foi possível publicar a vaga.',
      })
    } finally {
      setPublicando(false)
      setTimeout(() => setAlert(null), 4000)
    }
  }

  function handleEditar(vaga: Vaga) {
    setVagaEditando(vaga)
    setForm({
      titulo: vaga.titulo,
      descricao: vaga.descricao,
      area: vaga.area,
      localidade: vaga.localidade,
      modelo: vaga.modelo,
      tipoContrato: vaga.tipoContrato,
      nivel: vaga.nivel,
      salarioMin: vaga.salarioMin,
      salarioMax: vaga.salarioMax,
      quantidadeVagas: vaga.quantidadeVagas,
      prazoCandidatura: vaga.prazoCandidatura,
      beneficios: vaga.beneficios,
      cargaHoraria: vaga.cargaHoraria,
      horarioTrabalho: vaga.horarioTrabalho,
      escolaridade: vaga.escolaridade,
      experienciaMinima: vaga.experienciaMinima,
      pcd: vaga.pcd,
      habilidades: vaga.habilidades,
    })
    setShowModal(true)
  }

  async function handleSalvarEdicao() {
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setAlert({ type: 'error', message: 'Corrija os erros antes de salvar.' })
      setTimeout(() => setAlert(null), 4000)
      return
    }

    if (!vagaEditando) return
    setPublicando(true)

    try {
      await atualizarVaga(Number(vagaEditando.id), {
        vaga_titulo: form.titulo,
        vaga_descricao: form.descricao,
        vaga_area: form.area,
        vaga_localidade: form.localidade,
        vaga_modelo_trabalho: form.modelo,
        vaga_tipo_contrato: form.tipoContrato,
        vaga_nivel: form.nivel,
        vaga_qtd_vagas: Number(form.quantidadeVagas),
        vaga_pcd: form.pcd === 'Sim',
        vaga_salario_min: form.salarioMin ? Number(form.salarioMin) : null,
        vaga_salario_max: form.salarioMax ? Number(form.salarioMax) : null,
        vaga_beneficios: form.beneficios,
        vaga_carga_horaria: form.cargaHoraria,
        vaga_escolaridade_minima: form.escolaridade,
        vaga_experiencia_minima: form.experienciaMinima,
        vaga_prazo_candidatura: form.prazoCandidatura || null,
      })

      setVagas(prev => prev.map(v =>
        v.id === vagaEditando.id
          ? { ...v, ...form, habilidades: form.habilidades }
          : v
      ))
      setShowModal(false)
      setVagaEditando(null)
      setForm(emptyForm)
      setErrors({})
      setAlert({ type: 'success', message: 'Vaga atualizada!' })
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof ApiError ? error.message : 'Não foi possível atualizar a vaga.',
      })
    } finally {
      setPublicando(false)
      setTimeout(() => setAlert(null), 4000)
    }
  }

  async function handleExcluir(id: string) {
    setVagas(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, status: 'Inativa', dataAtualizacao: new Date().toISOString() }
          : v
      )
    )

    try {
      await encerrarVaga(Number(id))
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof ApiError ? error.message : 'Não foi possível encerrar a vaga no servidor.',
      })
      setTimeout(() => setAlert(null), 4000)
    }
  }

  function handleCancelar() {
    setShowModal(false)
    setVagaEditando(null)
    setForm(emptyForm)
    setErrors({})
  }

  const vagasAtivas = vagas.filter(v => v.status === 'Ativa')

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

      {vagasAtivas.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-sm">Nenhuma vaga criada ainda.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {vagasAtivas.map(vaga => (
            <div key={vaga.id} className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-[var(--color-text)]">{vaga.titulo}</h2>
                    <span className="text-xs bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-2 py-0.5 rounded-full font-medium">
                      {vaga.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                    {[vaga.area, vaga.modelo, vaga.tipoContrato, vaga.nivel].filter(Boolean).join(' • ')}
                  </p>
                  {vaga.localidade && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">📍 {vaga.localidade}</p>
                  )}
                  {vaga.descricao && (
                    <p className="text-sm text-[var(--color-text)] mt-2 line-clamp-2 break-all">{vaga.descricao}</p>
                  )}
                </div>
                <div className="flex gap-3 ml-4 shrink-0">
                  <button
                    onClick={() => handleEditar(vaga)}
                    className="text-[var(--color-primary)] text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(vaga.id)}
                    className="text-[var(--color-error)] text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              {vaga.habilidades.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {vaga.habilidades.map((h) => (
                    <span key={h} className="text-xs bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-2 py-0.5 rounded-full">
                      {h}
                    </span>
                  ))}
                </div>
              )}

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
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 overflow-y-auto pt-24 pb-10">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-4 px-8 pb-8 pt-10">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">{vagaEditando ? 'Editar vaga' : 'Nova vaga'}</h2>

            <div className="flex flex-col gap-5">

              {/* Título */}
              <Field label="Título *" error={errors.titulo} hint={`${form.titulo.length}/100`}>
                <input
                  type="text"
                  maxLength={100}
                  value={form.titulo}
                  onChange={e => set('titulo', e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Desenvolvedor Front-end"
                />
              </Field>

              {/* Descrição */}
              <Field label="Descrição *" error={errors.descricao} hint={`${form.descricao.length}/2000`}>
                <textarea
                  value={form.descricao}
                  onChange={e => set('descricao', e.target.value)}
                  rows={6}
                  className={inputClass}
                  placeholder="Descreva as responsabilidades, requisitos e diferenciais da vaga..."
                />
              </Field>

              {/* Área + Localidade */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Área *" error={errors.area}>
                  <input
                    type="text"
                    value={form.area}
                    onChange={e => set('area', e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: TI, Comercial"
                  />
                </Field>
                <Field label="Localidade *" error={errors.localidade}>
                  <input
                    type="text"
                    value={form.localidade}
                    onChange={e => set('localidade', e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: São Paulo/SP"
                  />
                </Field>
              </div>

              {/* Modelo de trabalho */}
              <Field label="Modelo de trabalho *">
                <div className="flex gap-3">
                  {WORK_MODELS.map(m => (
                    <RadioPill key={m} label={m} checked={form.modelo === m} onChange={() => set('modelo', m)} />
                  ))}
                </div>
              </Field>

              {/* Tipo de contrato */}
              <Field label="Tipo de contrato *">
                <div className="flex gap-3 flex-wrap">
                  {CONTRACT_TYPES.map(t => (
                    <RadioPill key={t} label={t} checked={form.tipoContrato === t} onChange={() => set('tipoContrato', t)} />
                  ))}
                </div>
              </Field>

              {/* Nível */}
              <Field label="Nível da vaga *">
                <div className="flex gap-3">
                  {LEVELS.map(l => (
                    <RadioPill key={l} label={l} checked={form.nivel === l} onChange={() => set('nivel', l)} />
                  ))}
                </div>
              </Field>

              {/* Quantidade de vagas */}
              <Field label="Quantidade de vagas *" error={errors.quantidadeVagas}>
                <input
                  type="number"
                  min={1}
                  value={form.quantidadeVagas}
                  onChange={e => set('quantidadeVagas', e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: 2"
                />
              </Field>

              {/* Faixa salarial */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Salário mín (R$)" error={errors.salarioMin}>
                  <input
                    type="number"
                    min={0}
                    value={form.salarioMin}
                    onChange={e => set('salarioMin', e.target.value)}
                    className={inputClass}
                    placeholder="Opcional"
                  />
                </Field>
                <Field label="Salário máx (R$)">
                  <input
                    type="number"
                    min={0}
                    value={form.salarioMax}
                    onChange={e => set('salarioMax', e.target.value)}
                    className={inputClass}
                    placeholder="Opcional"
                  />
                </Field>
              </div>

              {/* Prazo da candidatura */}
              <Field label="Prazo da candidatura">
                <input
                  type="date"
                  value={form.prazoCandidatura}
                  onChange={e => set('prazoCandidatura', e.target.value)}
                  className={inputClass}
                />
              </Field>

              {/* Benefícios */}
              <Field label="Benefícios">
                <textarea
                  value={form.beneficios}
                  onChange={e => set('beneficios', e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Ex.: VR, VA, plano de saúde..."
                />
              </Field>

              {/* Carga horária + Horário */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Carga horária semanal">
                  <input
                    type="text"
                    value={form.cargaHoraria}
                    onChange={e => set('cargaHoraria', e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: 40h"
                  />
                </Field>
                <Field label="Horário de trabalho">
                  <input
                    type="text"
                    value={form.horarioTrabalho}
                    onChange={e => set('horarioTrabalho', e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: seg-sex, 9h às 18h"
                  />
                </Field>
              </div>

              {/* Escolaridade + Experiência */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Escolaridade mínima">
                  <select
                    value={form.escolaridade}
                    onChange={e => set('escolaridade', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Selecione</option>
                    {EDUCATION_LEVELS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </Field>
                <Field label="Experiência mínima">
                  <input
                    type="text"
                    value={form.experienciaMinima}
                    onChange={e => set('experienciaMinima', e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: 1 ano"
                  />
                </Field>
              </div>

              {/* PCD */}
              <Field label="PCD *">
                <div className="flex gap-3">
                  {['Sim', 'Não'].map(op => (
                    <RadioPill key={op} label={op} checked={form.pcd === op} onChange={() => set('pcd', op)} />
                  ))}
                </div>
              </Field>

              {/* Habilidades */}
              <div>
                <p className="text-sm font-medium text-[var(--color-text)] mb-3">Habilidades</p>
                <div className="flex flex-wrap gap-2">
                  {(habilidadesDisponiveis.length > 0
                    ? habilidadesDisponiveis
                    : SKILLS_FALLBACK.map((nome, i) => ({ id: -(i + 1), nome }))
                  ).map(({ nome }) => {
                    const selected = form.habilidades.includes(nome)
                    return (
                      <button
                        key={nome}
                        type="button"
                        onClick={() => toggleHabilidade(nome)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          selected
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                            : 'bg-white border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
                        }`}
                      >
                        {nome}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={handleCancelar}
                className="px-5 py-2 rounded-lg text-sm font-medium text-[var(--color-text)] border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={vagaEditando ? handleSalvarEdicao : handlePublicar}
                disabled={publicando}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-[var(--color-text)] text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {publicando ? 'Salvando...' : vagaEditando ? 'Salvar' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputClass = 'w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)] bg-white focus:outline-none focus:border-[var(--color-primary)] transition-colors'

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
        {hint && <span className="text-xs text-[var(--color-text-muted)]">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  )
}

function RadioPill({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
        checked
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white font-medium'
          : 'bg-white border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
      }`}
    >
      {label}
    </button>
  )
}
