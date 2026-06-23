import { useEffect, useState } from 'react'
import { getSession } from '@/services/utils/http'
import { Alert } from '@/components/Alert'
import {
  buscarEstagiario,
  atualizarEstagiario,
  listarHabilidadesEstagiario,
  adicionarHabilidadeEstagiario,
  removerHabilidadeEstagiario,
  type Estagiario,
  type AtualizarEstagiarioPayload,
  type VinculoHabilidade,
  type Habilidade,
} from '@/services/EstagiarioService'
import { listarHabilidades } from '@/services/HabilidadesService'

// ── Constantes ────────────────────────────────────────────────────────────
const ESTADOS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS',
  'MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
]

const TURNO_LABEL: Record<string, string> = {
  manha: 'Manhã', tarde: 'Tarde', noite: 'Noite', integral: 'Integral',
}
const NIVEL_EXP_LABEL: Record<string, string> = {
  nenhuma: 'Nenhuma', baixa: 'Baixa', media: 'Média', alta: 'Alta',
}
const MODALIDADE_LABEL: Record<string, string> = {
  presencial: 'Presencial', remoto: 'Remoto', hibrido: 'Híbrido',
}
// ── Máscaras ──────────────────────────────────────────────────────────────
function mascaraTel(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

function mascaraDataBR(v: string) {
  return v.replace(/\D/g, '').slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
}

function dataBRParaISO(v: string) {
  const [dia, mes, ano] = v.split('/')
  if (!dia || !mes || !ano || ano.length !== 4) return ''
  return `${ano}-${mes}-${dia}`
}

function normalizarDataISO(v: string | null | undefined) {
  if (!v) return ''
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return dataBRParaISO(v)
  return v.slice(0, 10)
}

function formatarDataBR(v: string | null | undefined) {
  const iso = normalizarDataISO(v)
  const [ano, mes, dia] = iso.split('-')
  if (!ano || !mes || !dia) return ''
  return `${dia}/${mes}/${ano}`
}

function criarDataLocal(dataISO: string) {
  const [ano, mes, dia] = dataISO.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

function formatarCpf(cpf: string) {
  const limpo = cpf.replace(/\D/g, '')
  if (limpo.length !== 11) return cpf
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// ── Validação ─────────────────────────────────────────────────────────────
type FormErrors = Partial<Record<keyof Estagiario, string>>

function validar(f: Estagiario): FormErrors {
  const e: FormErrors = {}
  if (!f.estagiario_nome_completo.trim()) e.estagiario_nome_completo = 'Nome obrigatório.'
  if (!f.estagiario_telefone?.trim()) e.estagiario_telefone = 'Telefone obrigatório.'
  else if (f.estagiario_telefone.replace(/\D/g, '').length < 10) e.estagiario_telefone = 'Telefone inválido.'
  if (f.estagiario_linkedin_url && !f.estagiario_linkedin_url.startsWith('https://linkedin.com'))
    e.estagiario_linkedin_url = 'URL deve iniciar com https://linkedin.com'

  if (f.estagiario_previsao_formatura) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(f.estagiario_previsao_formatura) &&
        !/^\d{4}-\d{2}-\d{2}/.test(f.estagiario_previsao_formatura)) {
      e.estagiario_previsao_formatura = 'Use o formato dd/mm/aaaa.'
      return e
    }

    const formatura = criarDataLocal(normalizarDataISO(f.estagiario_previsao_formatura))
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    if (Number.isNaN(formatura.getTime())) {
      e.estagiario_previsao_formatura = 'Data de formatura inválida.'
      return e
    }

    if (formatura < hoje) {
      e.estagiario_previsao_formatura = 'Previsão de formatura não pode estar no passado.'
    }
  }

  return e
}

// ── Sub-componentes ───────────────────────────────────────────────────────
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mb-4 shadow-[var(--shadow-sm)]">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] pb-3 mb-4 border-b border-[var(--color-border)]">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function Campo({
  id, label, obrigatorio, erro, children,
}: {
  id: string; label: string; obrigatorio?: boolean; erro?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-[var(--color-text-muted)]">
        {label}
        {obrigatorio && <span className="text-[var(--color-error)] ml-0.5">*</span>}
      </label>
      {children}
      {erro && <span className="text-xs text-[var(--color-error)] mt-0.5">{erro}</span>}
    </div>
  )
}

const inputCls =
  'text-sm text-[var(--color-text)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 w-full outline-none transition-all focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(45,184,168,0.12)] disabled:opacity-60 disabled:cursor-default'

const inputErroCls =
  'text-sm text-[var(--color-text)] bg-[var(--color-bg)] border border-[var(--color-error)] rounded-[var(--radius-md)] px-3 py-2 w-full outline-none transition-all focus:border-[var(--color-error)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'

// ── Componente principal ──────────────────────────────────────────────────
export function PerfilUsuario() {
  const session = getSession()

  const [perfil, setPerfil] = useState<Estagiario | null>(null)
  const [form, setForm] = useState<Estagiario | null>(null)
  const [habilidades, setHabilidades] = useState<VinculoHabilidade[]>([])
  const [catalogoHabilidades, setCatalogoHabilidades] = useState<Habilidade[]>([])
  const [habilidadeSelecionada, setHabilidadeSelecionada] = useState('')
  const [salvandoHabilidade, setSalvandoHabilidade] = useState(false)
  const [removendoHabilidadeId, setRemovendoHabilidadeId] = useState<number | null>(null)
  const [erroHabilidade, setErroHabilidade] = useState<string | null>(null)
  const [erros, setErros] = useState<FormErrors>({})

  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)

  // ── Carregamento inicial ────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.id) {
      setErroCarregamento('Sessão expirada. Faça login novamente.')
      setCarregando(false)
      return
    }

    Promise.all([
      buscarEstagiario(session.id),
      listarHabilidadesEstagiario(session.id),
      listarHabilidades(),
    ])
      .then(([estagiario, vinculos, catalogo]) => {
        setPerfil(estagiario)
        setForm(estagiario)
        setHabilidades(vinculos)
        setCatalogoHabilidades(catalogo)
      })
      .catch(() => setErroCarregamento('Não foi possível carregar o perfil.'))
      .finally(() => setCarregando(false))
  }, [session?.id])

  // ── Habilidades: adicionar / remover vínculo ─────────────────────────────
  async function handleAdicionarHabilidade() {
    if (!session?.id || !habilidadeSelecionada) return

    setSalvandoHabilidade(true)
    setErroHabilidade(null)
    try {
      const resposta = await adicionarHabilidadeEstagiario(session.id, Number(habilidadeSelecionada))
      setHabilidades(prev => [...prev, resposta.vinculo])
      setHabilidadeSelecionada('')
    } catch {
      setErroHabilidade('Não foi possível adicionar a habilidade. Tente novamente.')
    } finally {
      setSalvandoHabilidade(false)
    }
  }

  async function handleRemoverHabilidade(idHabilidade: number) {
    if (!session?.id) return

    setRemovendoHabilidadeId(idHabilidade)
    setErroHabilidade(null)
    try {
      await removerHabilidadeEstagiario(session.id, idHabilidade)
      setHabilidades(prev => prev.filter(v => v.id_habilidade !== idHabilidade))
    } catch {
      setErroHabilidade('Não foi possível remover a habilidade. Tente novamente.')
    } finally {
      setRemovendoHabilidadeId(null)
    }
  }


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    if (!form) return
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value } as Estagiario)
    setErros(p => ({ ...p, [name]: undefined }))
  }

  function handleEditar() {
    setSucesso(false)
    setErroSalvar(null)
    setEditando(true)
  }

  function handleCancelar() {
    setForm(perfil)
    setErros({})
    setErroSalvar(null)
    setEditando(false)
  }

  async function handleSalvar() {
    if (!form || !session?.id) return

    const e = validar(form)
    if (Object.keys(e).length > 0) {
      setErros(e)
      setTimeout(() => {
        document.querySelector('.erro-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }

    setSalvando(true)
    setErroSalvar(null)

    const payload: AtualizarEstagiarioPayload = {
      estagiario_nome_completo: form.estagiario_nome_completo,
      estagiario_foto_perfil_url: form.estagiario_foto_perfil_url,
      estagiario_telefone: form.estagiario_telefone,
      estagiario_cidade: form.estagiario_cidade,
      estagiario_estado: form.estagiario_estado,
      estagiario_disponivel_remoto: form.estagiario_disponivel_remoto,
      estagiario_instituicao: form.estagiario_instituicao,
      estagiario_curso: form.estagiario_curso,
      estagiario_semestre_atual: form.estagiario_semestre_atual,
      estagiario_previsao_formatura: normalizarDataISO(form.estagiario_previsao_formatura),
      estagiario_turno: form.estagiario_turno,
      estagiario_area_interesse: form.estagiario_area_interesse,
      estagiario_nivel_experiencia: form.estagiario_nivel_experiencia,
      estagiario_modalidade_preferida: form.estagiario_modalidade_preferida,
      estagiario_carga_horaria_preferida: form.estagiario_carga_horaria_preferida,
      estagiario_aceita_bolsa_minima: form.estagiario_aceita_bolsa_minima,
      estagiario_cv_url: form.estagiario_cv_url,
      estagiario_linkedin_url: form.estagiario_linkedin_url,
      estagiario_portfolio_url: form.estagiario_portfolio_url,
      estagiario_bio: form.estagiario_bio,
    }

    try {
      const resposta = await atualizarEstagiario(session.id, payload)
      setPerfil(resposta.estagiario)
      setForm(resposta.estagiario)
      setSucesso(true)
      setEditando(false)
    } catch {
      setErroSalvar('Não foi possível salvar as alterações. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  // ── Estados de carregamento / erro ───────────────────────────────────
  if (carregando) {
    return <p className="text-sm text-[var(--color-text-muted)] text-center py-12">Carregando perfil...</p>
  }

  if (erroCarregamento || !form) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert type="error" message={erroCarregamento ?? 'Não foi possível carregar o perfil.'} />
      </div>
    )
  }

  // ── Avatar ────────────────────────────────────────────────────────────
  const iniciais = form.estagiario_nome_completo
    .split(' ').filter(Boolean).slice(0, 2)
    .map(n => n[0].toUpperCase()).join('')

  const links: { field: keyof Estagiario; label: string; placeholder: string }[] = [
    { field: 'estagiario_cv_url', label: 'Currículo (PDF)', placeholder: 'https://drive.google.com/...' },
    { field: 'estagiario_linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/seuperfil' },
    { field: 'estagiario_portfolio_url', label: 'Portfólio', placeholder: 'https://...' },
  ]

  return (
    <div className="max-w-2xl mx-auto">

      {(sucesso || erroSalvar) && (
        <div className="mb-4">
          <Alert
            type={sucesso ? 'success' : 'error'}
            message={sucesso ? 'Perfil atualizado com sucesso.' : erroSalvar ?? ''}
            onClose={() => { setSucesso(false); setErroSalvar(null) }}
          />
        </div>
      )}

      {/* ── Cabeçalho ── */}
      <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mb-4 shadow-[var(--shadow-sm)] flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {form.estagiario_foto_perfil_url
            ? <img src={form.estagiario_foto_perfil_url} alt={form.estagiario_nome_completo} className="w-full h-full object-cover" />
            : <span className="text-xl font-semibold text-[var(--color-primary)]">{iniciais}</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-[var(--color-text)] truncate">{form.estagiario_nome_completo}</h1>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${
                form.estagiario_perfil_completo
                  ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}
            >
              {form.estagiario_perfil_completo ? 'Perfil completo' : 'Perfil incompleto'}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] truncate">{form.estagiario_email}</p>
          {form.estagiario_cidade && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {form.estagiario_cidade}{form.estagiario_estado ? `, ${form.estagiario_estado}` : ''}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end flex-shrink-0">
          {!editando ? (
            <button
              onClick={handleEditar}
              className="text-sm font-medium px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Editar perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelar}
                className="text-sm px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-muted)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={salvando}
                className="text-sm font-medium px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Conta ── */}
      <Secao titulo="Conta">
        {editando && (
          <div className="mb-4">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Foto de perfil</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] border border-[var(--color-border)] flex items-center justify-center text-sm font-semibold text-[var(--color-primary)] overflow-hidden flex-shrink-0">
                {form.estagiario_foto_perfil_url
                  ? <img src={form.estagiario_foto_perfil_url} alt="" className="w-full h-full object-cover" />
                  : iniciais}
              </div>
              <Campo id="estagiario_foto_perfil_url" label="URL da foto">
                <input
                  id="estagiario_foto_perfil_url" name="estagiario_foto_perfil_url" type="url"
                  placeholder="https://..."
                  value={form.estagiario_foto_perfil_url ?? ''} onChange={handleChange}
                  className={inputCls}
                />
              </Campo>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Campo id="estagiario_email" label="E-mail">
            <input id="estagiario_email" value={form.estagiario_email} disabled className={inputCls} />
          </Campo>
          <Campo id="estagiario_cpf" label="CPF">
            <input id="estagiario_cpf" value={formatarCpf(form.estagiario_cpf)} disabled className={inputCls} />
          </Campo>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">E-mail e CPF não podem ser alterados.</p>
      </Secao>

      {/* ── Dados pessoais ── */}
      <Secao titulo="Dados pessoais">
        <div className="flex flex-col gap-3">
          <Campo id="estagiario_nome_completo" label="Nome completo" obrigatorio erro={erros.estagiario_nome_completo}>
            <input
              id="estagiario_nome_completo" name="estagiario_nome_completo" type="text"
              value={form.estagiario_nome_completo} onChange={handleChange}
              disabled={!editando}
              className={`${erros.estagiario_nome_completo ? inputErroCls : inputCls} ${erros.estagiario_nome_completo ? 'erro-field' : ''}`}
            />
          </Campo>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo id="estagiario_telefone" label="Telefone" obrigatorio erro={erros.estagiario_telefone}>
              <input
                id="estagiario_telefone" name="estagiario_telefone" type="tel"
                placeholder="(00) 90000-0000"
                value={form.estagiario_telefone ?? ''}
                onChange={e => {
                  if (!editando) return
                  setForm({ ...form, estagiario_telefone: mascaraTel(e.target.value) })
                  setErros(p => ({ ...p, estagiario_telefone: undefined }))
                }}
                disabled={!editando}
                className={`${erros.estagiario_telefone ? inputErroCls : inputCls} ${erros.estagiario_telefone ? 'erro-field' : ''}`}
              />
            </Campo>

            <div className="grid grid-cols-2 gap-2">
              <Campo id="estagiario_cidade" label="Cidade">
                <input
                  id="estagiario_cidade" name="estagiario_cidade" type="text"
                  value={form.estagiario_cidade ?? ''} onChange={handleChange}
                  disabled={!editando}
                  className={inputCls}
                />
              </Campo>
              <Campo id="estagiario_estado" label="UF">
                <select
                  id="estagiario_estado" name="estagiario_estado"
                  value={form.estagiario_estado ?? ''} onChange={handleChange}
                  disabled={!editando}
                  className={inputCls}
                >
                  <option value="">UF</option>
                  {ESTADOS.map(uf => <option key={uf}>{uf}</option>)}
                </select>
              </Campo>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
            <input
              type="checkbox" name="estagiario_disponivel_remoto"
              checked={form.estagiario_disponivel_remoto ?? false} onChange={handleChange}
              disabled={!editando}
              className="w-4 h-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--color-text)]">Disponível para trabalho remoto</span>
          </label>
        </div>
      </Secao>

      {/* ── Formação acadêmica ── */}
      <Secao titulo="Formação acadêmica">
        <div className="flex flex-col gap-3">
          <Campo id="estagiario_instituicao" label="Instituição">
            <input
              id="estagiario_instituicao" name="estagiario_instituicao" type="text"
              value={form.estagiario_instituicao ?? ''} onChange={handleChange}
              disabled={!editando}
              className={inputCls}
            />
          </Campo>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo id="estagiario_curso" label="Curso">
              <input
                id="estagiario_curso" name="estagiario_curso" type="text"
                value={form.estagiario_curso ?? ''} onChange={handleChange}
                disabled={!editando}
                className={inputCls}
              />
            </Campo>
            <Campo id="estagiario_semestre_atual" label="Semestre atual">
              <input
                id="estagiario_semestre_atual" name="estagiario_semestre_atual" type="number"
                min={1} max={14}
                value={form.estagiario_semestre_atual ?? ''} onChange={handleChange}
                disabled={!editando}
                className={inputCls}
              />
            </Campo>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo id="estagiario_previsao_formatura" label="Previsão de formatura" erro={erros.estagiario_previsao_formatura}>
              <input
                id="estagiario_previsao_formatura"
                name="estagiario_previsao_formatura"
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                value={formatarDataBR(form.estagiario_previsao_formatura)}
                onChange={e => {
                  if (!editando) return
                  setForm({ ...form, estagiario_previsao_formatura: mascaraDataBR(e.target.value) })
                  setErros(p => ({ ...p, estagiario_previsao_formatura: undefined }))
                }}
                disabled={!editando}
                className={inputCls}
              />
            </Campo>
            <Campo id="estagiario_turno" label="Turno">
              {editando ? (
                <select
                  id="estagiario_turno" name="estagiario_turno"
                  value={form.estagiario_turno ?? ''} onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">Selecione</option>
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                  <option value="integral">Integral</option>
                </select>
              ) : (
                <input
                  value={form.estagiario_turno ? TURNO_LABEL[form.estagiario_turno] : '—'}
                  disabled
                  className={inputCls}
                />
              )}
            </Campo>
          </div>
        </div>
      </Secao>

      {/* ── Habilidades ── */}
      <Secao titulo="Habilidades">
        {erroHabilidade && (
          <div className="mb-3">
            <Alert type="error" message={erroHabilidade} onClose={() => setErroHabilidade(null)} />
          </div>
        )}

        {habilidades.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Nenhuma habilidade vinculada ainda.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {habilidades.map(v => (
              <span
                key={v.id_estagiario_habilidade}
                className="text-xs font-medium px-3 py-1 rounded-full border flex items-center gap-1.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary-light)]"
              >
                {v.habilidade.habilidade_nome}
                <button
                  type="button"
                  onClick={() => handleRemoverHabilidade(v.id_habilidade)}
                  disabled={removendoHabilidadeId === v.id_habilidade}
                  aria-label={`Remover ${v.habilidade.habilidade_nome}`}
                  className="opacity-60 hover:opacity-100 disabled:opacity-30 transition-opacity"
                >
                  {removendoHabilidadeId === v.id_habilidade ? '…' : '×'}
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <select
            value={habilidadeSelecionada}
            onChange={e => setHabilidadeSelecionada(e.target.value)}
            className={`${inputCls} sm:max-w-xs`}
          >
            <option value="">Selecione uma habilidade...</option>
            {catalogoHabilidades
              .filter(h => !habilidades.some(v => v.id_habilidade === h.id_habilidade))
              .map(h => (
                <option key={h.id_habilidade} value={h.id_habilidade}>
                  {h.habilidade_nome}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={handleAdicionarHabilidade}
            disabled={!habilidadeSelecionada || salvandoHabilidade}
            className="text-sm font-medium px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {salvandoHabilidade ? 'Adicionando...' : 'Adicionar habilidade'}
          </button>
        </div>

        {catalogoHabilidades.length > 0 &&
          catalogoHabilidades.every(h => habilidades.some(v => v.id_habilidade === h.id_habilidade)) && (
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Todas as habilidades do catálogo já estão vinculadas ao seu perfil.
            </p>
        )}
      </Secao>

      {/* ── Preferências profissionais ── */}
      <Secao titulo="Preferências profissionais">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo id="estagiario_area_interesse" label="Área de interesse">
              <input
                id="estagiario_area_interesse" name="estagiario_area_interesse" type="text"
                value={form.estagiario_area_interesse ?? ''} onChange={handleChange}
                disabled={!editando}
                className={inputCls}
              />
            </Campo>
            <Campo id="estagiario_nivel_experiencia" label="Nível de experiência">
              {editando ? (
                <select
                  id="estagiario_nivel_experiencia" name="estagiario_nivel_experiencia"
                  value={form.estagiario_nivel_experiencia ?? ''} onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">Selecione</option>
                  <option value="nenhuma">Nenhuma</option>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              ) : (
                <input
                  value={form.estagiario_nivel_experiencia ? NIVEL_EXP_LABEL[form.estagiario_nivel_experiencia] : '—'}
                  disabled
                  className={inputCls}
                />
              )}
            </Campo>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo id="estagiario_modalidade_preferida" label="Modalidade preferida">
              {editando ? (
                <select
                  id="estagiario_modalidade_preferida" name="estagiario_modalidade_preferida"
                  value={form.estagiario_modalidade_preferida ?? ''} onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">Selecione</option>
                  <option value="presencial">Presencial</option>
                  <option value="remoto">Remoto</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              ) : (
                <input
                  value={form.estagiario_modalidade_preferida ? MODALIDADE_LABEL[form.estagiario_modalidade_preferida] : '—'}
                  disabled
                  className={inputCls}
                />
              )}
            </Campo>
            <Campo id="estagiario_carga_horaria_preferida" label="Carga horária (h/semana)">
              <input
                id="estagiario_carga_horaria_preferida" name="estagiario_carga_horaria_preferida" type="number"
                min={1} max={44}
                value={form.estagiario_carga_horaria_preferida ?? ''} onChange={handleChange}
                disabled={!editando}
                className={inputCls}
              />
            </Campo>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
            <input
              type="checkbox" name="estagiario_aceita_bolsa_minima"
              checked={form.estagiario_aceita_bolsa_minima ?? false} onChange={handleChange}
              disabled={!editando}
              className="w-4 h-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--color-text)]">Aceito receber apenas bolsa mínima</span>
          </label>
        </div>
      </Secao>

      {/* ── Links e currículo ── */}
      <Secao titulo="Links e currículo">
        <div className="flex flex-col gap-3">
          {links.map(({ field, label, placeholder }) => (
            <Campo
              key={field}
              id={field}
              label={label}
              erro={erros[field] as string | undefined}
            >
              {editando ? (
                <input
                  id={field} name={field} type="url"
                  placeholder={placeholder}
                  value={(form[field] as string) ?? ''}
                  onChange={handleChange}
                  className={erros[field] ? `${inputErroCls} erro-field` : inputCls}
                />
              ) : (
                (form[field] as string)
                  ? (
                      <a
                        href={form[field] as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--color-primary)] hover:underline truncate"
                      >
                        {form[field] as string}
                      </a>
                    )
                  : <span className="text-sm text-[var(--color-text-muted)]">Não informado</span>
              )}
            </Campo>
          ))}
        </div>
      </Secao>

      {/* ── Bio ── */}
      <Secao titulo="Bio">
        <Campo id="estagiario_bio" label="Apresentação pessoal">
          <textarea
            id="estagiario_bio" name="estagiario_bio"
            placeholder="Fale um pouco sobre você, seus objetivos e diferenciais..."
            value={form.estagiario_bio ?? ''} onChange={handleChange}
            disabled={!editando}
            rows={4}
            className={`${inputCls} resize-y`}
          />
        </Campo>
      </Secao>

      {/* ── Rodapé edição ── */}
      {editando && (
        <div className="flex justify-end gap-3 mt-2 mb-8">
          <button
            onClick={handleCancelar}
            className="text-sm px-5 py-2.5 border border-[var(--color-border)] text-[var(--color-text-muted)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="text-sm font-medium px-6 py-2.5 bg-[var(--color-text)] text-white rounded-[var(--radius-md)] hover:bg-[#0f1a26] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      )}
    </div>
  )
}
