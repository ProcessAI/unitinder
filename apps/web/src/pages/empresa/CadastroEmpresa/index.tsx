import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/Alert'
import { api, saveSession, ApiError } from '@/lib/api'

type FormData = {
  nomeEmpresa: string
  cnpj: string
  email: string
  telefone: string
  areaAtuacao: string
  descricao: string
  senha: string
  confirmarSenha: string
}

type Erros = Partial<Record<keyof FormData, string>>

const AREAS_ATUACAO = [
  { value: 'tecnologia', label: 'Tecnologia da Informação' },
  { value: 'educacao', label: 'Educação' },
  { value: 'saude', label: 'Saúde / Medicina' },
  { value: 'financeiro', label: 'Financeiro / Bancário' },
  { value: 'varejo', label: 'Varejo / Comércio' },
  { value: 'industria', label: 'Indústria / Manufatura' },
  { value: 'logistica', label: 'Logística / Transporte' },
  { value: 'marketing', label: 'Comunicação / Marketing' },
  { value: 'engenharia', label: 'Engenharia / Construção' },
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'contabilidade', label: 'Contabilidade / Auditoria' },
  { value: 'juridico', label: 'Jurídico' },
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'alimentacao', label: 'Alimentação / Gastronomia' },
  { value: 'energia', label: 'Energia / Utilities' },
  { value: 'entretenimento', label: 'Entretenimento / Mídia' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'outros', label: 'Outros' },
]

function formatarCnpj(valor: string) {
  const digits = valor.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function formatarTelefone(valor: string) {
  const digits = valor.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function EyeIcon({ aberto }: { aberto: boolean }) {
  if (aberto) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

export function CadastroEmpresa() {
  const navigate = useNavigate()
  const [enviando, setEnviando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)
  const [erros, setErros] = useState<Erros>({})
  const [alerta, setAlerta] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const [formData, setFormData] = useState<FormData>({
    nomeEmpresa: '',
    cnpj: '',
    email: '',
    telefone: '',
    areaAtuacao: '',
    descricao: '',
    senha: '',
    confirmarSenha: '',
  })

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target

    let valorFormatado = value
    if (name === 'cnpj') valorFormatado = formatarCnpj(value)
    if (name === 'telefone') valorFormatado = formatarTelefone(value)

    setFormData((prev) => ({ ...prev, [name]: valorFormatado }))
    setErros((prev) => ({ ...prev, [name]: undefined }))
  }

  function validar(): Erros {
    const e: Erros = {}
    if (!formData.nomeEmpresa.trim()) e.nomeEmpresa = 'Nome da empresa é obrigatório.'
    if (!formData.cnpj || formData.cnpj.replace(/\D/g, '').length < 14) e.cnpj = 'CNPJ deve ter 14 dígitos.'
    if (!formData.email.trim()) e.email = 'E-mail é obrigatório.'
    if (!formData.telefone || formData.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido.'
    if (!formData.areaAtuacao) e.areaAtuacao = 'Selecione uma área de atuação.'
    if (!formData.descricao.trim()) e.descricao = 'Descrição é obrigatória.'
    if (!formData.senha) e.senha = 'Senha é obrigatória.'
    else if (formData.senha.length < 6) e.senha = 'A senha deve ter no mínimo 6 caracteres.'
    if (formData.senha !== formData.confirmarSenha) e.confirmarSenha = 'As senhas não coincidem.'
    return e
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAlerta(null)

    const errosValidacao = validar()
    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      return
    }

    setEnviando(true)

    try {
      const resposta = await api.registroEmpresa({
        nomeEmpresa: formData.nomeEmpresa,
        cnpj: formData.cnpj,
        email: formData.email,
        senha: formData.senha,
        setor: formData.areaAtuacao,
        descricao: formData.descricao,
      })

      saveSession({ token: resposta.token, role: 'empresa', id: resposta.empresa.id })

      setAlerta({
        type: 'success',
        message: 'Empresa cadastrada com sucesso!',
      })

      setTimeout(() => navigate('/empresa'), 1200)
    } catch (error) {
      setAlerta({
        type: 'error',
        message: error instanceof ApiError ? error.message : 'Não foi possível cadastrar a empresa.',
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-sm font-semibold text-[var(--color-primary)]">
          Cadastro de empresa
        </span>

        <h1 className="mt-2 text-2xl font-bold text-[var(--color-text)]">
          Crie o perfil da sua empresa
        </h1>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Cadastre sua empresa para publicar vagas e encontrar candidatos na plataforma.
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
        <div className="flex flex-col gap-1">
          <label htmlFor="nomeEmpresa" className="text-sm font-medium text-[var(--color-text)]">
            Nome da empresa
          </label>

          <input
            id="nomeEmpresa"
            name="nomeEmpresa"
            value={formData.nomeEmpresa}
            onChange={handleChange}
            placeholder="Ex: Tech Solutions"
            className={`rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] ${erros.nomeEmpresa ? 'border-red-400' : 'border-[var(--color-border)]'}`}
          />
          {erros.nomeEmpresa && <span className="text-xs text-red-500">{erros.nomeEmpresa}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cnpj" className="text-sm font-medium text-[var(--color-text)]">
            CNPJ
          </label>

          <input
            id="cnpj"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            className={`rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] ${erros.cnpj ? 'border-red-400' : 'border-[var(--color-border)]'}`}
          />
          {erros.cnpj && <span className="text-xs text-red-500">{erros.cnpj}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
            E-mail corporativo
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="empresa@email.com"
            className={`rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] ${erros.email ? 'border-red-400' : 'border-[var(--color-border)]'}`}
          />
          {erros.email && <span className="text-xs text-red-500">{erros.email}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="telefone" className="text-sm font-medium text-[var(--color-text)]">
            Telefone
          </label>

          <input
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            inputMode="numeric"
            className={`rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] ${erros.telefone ? 'border-red-400' : 'border-[var(--color-border)]'}`}
          />
          {erros.telefone && <span className="text-xs text-red-500">{erros.telefone}</span>}
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="areaAtuacao" className="text-sm font-medium text-[var(--color-text)]">
            Área de atuação
          </label>

          <select
            id="areaAtuacao"
            name="areaAtuacao"
            value={formData.areaAtuacao}
            onChange={handleChange}
            className={`rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] ${erros.areaAtuacao ? 'border-red-400' : 'border-[var(--color-border)]'}`}
          >
            <option value="">Selecione uma área</option>
            {AREAS_ATUACAO.map((area) => (
              <option key={area.value} value={area.value}>{area.label}</option>
            ))}
          </select>
          {erros.areaAtuacao && <span className="text-xs text-red-500">{erros.areaAtuacao}</span>}
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="descricao" className="text-sm font-medium text-[var(--color-text)]">
            Descrição da empresa
          </label>

          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows={4}
            placeholder="Conte um pouco sobre a empresa..."
            className={`resize-none rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] ${erros.descricao ? 'border-red-400' : 'border-[var(--color-border)]'}`}
          />
          {erros.descricao && <span className="text-xs text-red-500">{erros.descricao}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="senha" className="text-sm font-medium text-[var(--color-text)]">
            Senha
          </label>

          <div className="relative">
            <input
              id="senha"
              name="senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={formData.senha}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              className={`w-full rounded-lg border px-4 py-3 pr-11 text-sm outline-none focus:border-[var(--color-primary)] ${erros.senha ? 'border-red-400' : 'border-[var(--color-border)]'}`}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-primary)]"
            >
              <EyeIcon aberto={mostrarSenha} />
            </button>
          </div>
          {erros.senha && <span className="text-xs text-red-500">{erros.senha}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirmarSenha" className="text-sm font-medium text-[var(--color-text)]">
            Confirmar senha
          </label>

          <div className="relative">
            <input
              id="confirmarSenha"
              name="confirmarSenha"
              type={mostrarConfirmarSenha ? 'text' : 'password'}
              value={formData.confirmarSenha}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              className={`w-full rounded-lg border px-4 py-3 pr-11 text-sm outline-none focus:border-[var(--color-primary)] ${erros.confirmarSenha ? 'border-red-400' : 'border-[var(--color-border)]'}`}
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmarSenha((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-primary)]"
            >
              <EyeIcon aberto={mostrarConfirmarSenha} />
            </button>
          </div>
          {erros.confirmarSenha && <span className="text-xs text-red-500">{erros.confirmarSenha}</span>}
        </div>

        <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            {enviando ? 'Cadastrando...' : 'Cadastrar empresa'}
          </button>
        </div>
      </form>
    </div>
  )
}