import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { api, saveSession, ApiError } from '@/services/utils/http'
import { Alert } from '@/components/Alert'

function formatarCnpj(valor: string) {
  const digits = valor.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function Login() {
  const navigate = useNavigate()
  const tipoUsuario = localStorage.getItem('tipoUsuario') ?? 'empresa'
  const isEmpresa = tipoUsuario === 'empresa'

  const [identificador, setIdentificador] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async () => {
    setErro(null)

    if (!identificador || !senha) {
      setErro(isEmpresa ? 'Informe o CNPJ e a senha.' : 'Informe o e-mail e a senha.')
      return
    }

    setCarregando(true)

    try {
      const resposta = await api.login(identificador, senha)

      saveSession({
        token: resposta.token,
        role: resposta.role,
        id: resposta.role === 'empresa' ? resposta.empresa!.id : resposta.estagiario!.id,
      })

      if (resposta.role === 'empresa') {
        navigate('/empresa')
        return
      }

      navigate('/usuario')
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F5F7]">
      <header className="flex h-14 items-center justify-between bg-white px-10 shadow-sm">
        <img
          src={logo}
          alt="UniTinder"
          className="h-8"
        />

        <span className="text-sm font-medium text-[#1F4068]">
          Entrar
        </span>
      </header>

      <main className="flex flex-col items-center pt-10">
        <img
          src={logo}
          alt="UniTinder"
          className="mb-4 w-64"
        />

        <h1 className="mb-4 text-3xl font-bold text-[#1F4068]">
          Entrar
        </h1>

        <div className="w-[420px] rounded-lg border border-gray-200 bg-white p-6">
          {erro && (
            <div className="mb-4">
              <Alert type="error" message={erro} onClose={() => setErro(null)} />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-[#1F4068]">
              {isEmpresa ? 'CNPJ' : 'E-mail'}
            </label>

            <input
              type={isEmpresa ? 'text' : 'email'}
              placeholder={isEmpresa ? '00.000.000/0000-00' : 'seu@email.com'}
              inputMode={isEmpresa ? 'numeric' : 'email'}
              value={identificador}
              onChange={(event) =>
                setIdentificador(isEmpresa ? formatarCnpj(event.target.value) : event.target.value)
              }
              className="w-full rounded border border-gray-200 p-2 outline-none focus:border-[#1F4068]"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1 block text-sm font-medium text-[#1F4068]">
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              className="w-full rounded border border-gray-200 p-2 outline-none focus:border-[#1F4068]"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={carregando}
            className="w-full rounded bg-[#1F4068] py-2 text-white transition hover:bg-[#173553] disabled:opacity-60"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Não tem conta?{' '}
            <button
              type="button"
              onClick={() => navigate(isEmpresa ? '/empresa/cadastro' : '/usuario/cadastro')}
              className="font-medium text-[#1F4068] hover:underline"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}