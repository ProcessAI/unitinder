import { useState } from 'react'
import { Alert } from '@/components/Alert'

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

export function CadastroEmpresa() {
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (formData.senha !== formData.confirmarSenha) {
      setAlerta({
        type: 'error',
        message: 'As senhas não coincidem.',
      })
      return
    }

    setAlerta({
      type: 'success',
      message: 'Empresa cadastrada com sucesso!',
    })

    console.log('Dados da empresa:', formData)
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
        <div className="flex flex-col gap-2">
          <label htmlFor="nomeEmpresa" className="text-sm font-medium text-[var(--color-text)]">
            Nome da empresa
          </label>

          <input
            id="nomeEmpresa"
            name="nomeEmpresa"
            value={formData.nomeEmpresa}
            onChange={handleChange}
            required
            placeholder="Ex: Tech Solutions"
            className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="cnpj" className="text-sm font-medium text-[var(--color-text)]">
            CNPJ
          </label>

          <input
            id="cnpj"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            required
            placeholder="00.000.000/0001-00"
            className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
            E-mail corporativo
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="empresa@email.com"
            className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="telefone" className="text-sm font-medium text-[var(--color-text)]">
            Telefone
          </label>

          <input
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            required
            placeholder="(00) 00000-0000"
            className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
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
            required
            className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Selecione uma área</option>
            <option value="tecnologia">Tecnologia</option>
            <option value="educacao">Educação</option>
            <option value="saude">Saúde</option>
            <option value="financeiro">Financeiro</option>
            <option value="varejo">Varejo</option>
            <option value="outros">Outros</option>
          </select>
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
            required
            rows={4}
            placeholder="Conte um pouco sobre a empresa..."
            className="resize-none rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="senha" className="text-sm font-medium text-[var(--color-text)]">
            Senha
          </label>

          <input
            id="senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleChange}
            required
            placeholder="Digite sua senha"
            className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmarSenha" className="text-sm font-medium text-[var(--color-text)]">
            Confirmar senha
          </label>

          <input
            id="confirmarSenha"
            name="confirmarSenha"
            type="password"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
            placeholder="Confirme sua senha"
            className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
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
            className="rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
          >
            Cadastrar empresa
          </button>
        </div>
      </form>
    </div>
  )
}