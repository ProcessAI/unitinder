import { useEffect, useState } from 'react'
import { api, getSession, ApiError } from '@/services/utils/http'
import { Alert } from '@/components/Alert'

// ------- tipos locais -------
type EmpresaDados = EmpresaPublica

interface EmpresaPublica {
  id_empresa: number
  empresa_cnpj: string
  empresa_nome: string
  empresa_setor: string | null
  empresa_cidade: string | null
  empresa_descricao: string | null
  empresa_status: string
  empresa_created_at: string
  empresa_updated_at: string
}

interface FormEdicao {
  empresa_nome: string
  empresa_setor: string
  empresa_cidade: string
  empresa_descricao: string
}

// ------- helpers -------
function formatarCNPJ(cnpj: string) {
  const s = cnpj.replace(/\D/g, '').slice(0, 14).padStart(14, '0')
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12, 14)}`
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ------- componente -------
export function PerfilEmpresa() {
  const session = getSession()

  const [empresa, setEmpresa] = useState<EmpresaDados | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // modal
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormEdicao>({
    empresa_nome: '',
    empresa_setor: '',
    empresa_cidade: '',
    empresa_descricao: '',
  })
  const [salvando, setSalvando] = useState(false)
  const [erroModal, setErroModal] = useState<string | null>(null)

  // ------- busca os dados -------
  useEffect(() => {
    if (!session) return

    api.buscarEmpresa(session.id)
      .then((data: any) => setEmpresa(data))
      .catch((err: ApiError) => setAlerta({ type: 'error', message: err.message }))
      .finally(() => setCarregando(false))
  }, [])

  // ------- abre o modal com os dados atuais -------
  function abrirModal() {
    if (!empresa) return
    setForm({
      empresa_nome: empresa.empresa_nome ?? '',
      empresa_setor: empresa.empresa_setor ?? '',
      empresa_cidade: empresa.empresa_cidade ?? '',
      empresa_descricao: empresa.empresa_descricao ?? '',
    })
    setErroModal(null)
    setModalAberto(true)
  }

  // ------- salva as alterações -------
  async function salvar() {
    if (!empresa || !session) return

    if (!form.empresa_nome.trim()) {
      setErroModal('O nome da empresa é obrigatório.')
      return
    }

    setSalvando(true)
    setErroModal(null)

    try {
      const atualizada = await api.atualizarEmpresa(empresa.id_empresa, {
        nomeEmpresa: form.empresa_nome,
        setor: form.empresa_setor,
        cidade: form.empresa_cidade,
        descricao: form.empresa_descricao,
      })
      setEmpresa(atualizada)
      setModalAberto(false)
      setAlerta({ type: 'success', message: 'Perfil atualizado com sucesso!' })
    } catch (err) {
      setErroModal(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSalvando(false)
    }
  }

  // ------- loading -------
  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-muted)]">Carregando perfil…</p>
        </div>
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="flex flex-col gap-4">
        {alerta && (
          <Alert type={alerta.type} message={alerta.message} onClose={() => setAlerta(null)} />
        )}
        <p className="text-[var(--color-text-muted)]">Não foi possível carregar o perfil.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* alerta global */}
      {alerta && (
        <Alert type={alerta.type} message={alerta.message} onClose={() => setAlerta(null)} />
      )}

      {/* cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-primary)]">
            Perfil da empresa
          </p>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{empresa.empresa_nome}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Membro desde {formatarData(empresa.empresa_created_at)}
          </p>
        </div>

        <button
          onClick={abrirModal}
          className="shrink-0 flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-medium px-4 py-2 rounded-lg transition duration-150"
        >
          {/* ícone lápis */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Editar perfil
        </button>
      </div>

      {/* cards de informação */}
      <div className="grid grid-cols-1 gap-4">

        {/* identificação */}
        <section className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Identificação
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Razão social" valor={empresa.empresa_nome} />
            <Campo label="CNPJ" valor={formatarCNPJ(empresa.empresa_cnpj)} />
            <Campo label="Setor" valor={empresa.empresa_setor || '—'} />
            <Campo label="Cidade" valor={empresa.empresa_cidade || '—'} />
          </div>
        </section>

        {/* sobre */}
        <section className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Sobre a empresa
          </h2>

          {empresa.empresa_descricao ? (
            <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
              {empresa.empresa_descricao}
            </p>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] italic">
              Nenhuma descrição cadastrada. Clique em "Editar perfil" para adicionar.
            </p>
          )}
        </section>

        {/* status */}
        <section className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-xl p-5 flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-muted)]">Status da conta</span>
          <span
            className={[
              'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full',
              empresa.empresa_status === 'A'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600',
            ].join(' ')}
          >
            <span
              className={[
                'w-1.5 h-1.5 rounded-full',
                empresa.empresa_status === 'A' ? 'bg-emerald-500' : 'bg-red-500',
              ].join(' ')}
            />
            {empresa.empresa_status === 'A' ? 'Ativa' : 'Inativa'}
          </span>
        </section>
      </div>

      {/* =================== MODAL =================== */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalAberto(false)
          }}
        >
          <div className="bg-[var(--color-white)] rounded-2xl shadow-xl w-full max-w-lg flex flex-col gap-5 p-6 animate-[fadeIn_0.15s_ease]">

            {/* cabeçalho do modal */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Editar perfil</h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
                aria-label="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* erro dentro do modal */}
            {erroModal && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {erroModal}
              </div>
            )}

            {/* campos */}
            <div className="flex flex-col gap-4">
              <CampoInput
                label="Razão social *"
                value={form.empresa_nome}
                onChange={(v) => setForm((f) => ({ ...f, empresa_nome: v }))}
                placeholder="Nome da empresa"
              />
              <CampoInput
                label="Setor"
                value={form.empresa_setor}
                onChange={(v) => setForm((f) => ({ ...f, empresa_setor: v }))}
                placeholder="ex: Tecnologia, Saúde, Educação"
              />
              <CampoInput
                label="Cidade"
                value={form.empresa_cidade}
                onChange={(v) => setForm((f) => ({ ...f, empresa_cidade: v }))}
                placeholder="ex: São Paulo, SP"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Sobre a empresa
                </label>
                <textarea
                  rows={4}
                  value={form.empresa_descricao}
                  onChange={(e) => setForm((f) => ({ ...f, empresa_descricao: e.target.value }))}
                  placeholder="Descreva brevemente a empresa, sua missão, cultura…"
                  className="w-full text-sm text-[var(--color-text)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* aviso CNPJ */}
            <p className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg)] rounded-lg px-3 py-2 border border-[var(--color-border)]">
              O <strong>CNPJ</strong> não pode ser alterado. Para correções, entre em contato com o suporte.
            </p>

            {/* botões */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setModalAberto(false)}
                disabled={salvando}
                className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition duration-150"
              >
                {salvando && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {salvando ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ------- sub-componentes simples -------

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-[var(--color-text)]">{valor}</span>
    </div>
  )
}

function CampoInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm text-[var(--color-text)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition placeholder:text-gray-400"
      />
    </div>
  )
}