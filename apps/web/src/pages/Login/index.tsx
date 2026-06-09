import { useNavigate } from 'react-router-dom'
import logo from '@/assets/logo.png'

export function Login() {
  const navigate = useNavigate()

  const handleLogin = () => {
    const tipo = localStorage.getItem('tipoUsuario')

    if (tipo === 'empresa') {
      navigate('/empresa')
      return
    }

    navigate('/usuario')
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
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-[#1F4068]">
              Email
            </label>

            <input
              type="email"
              className="w-full rounded border border-gray-200 p-2 outline-none focus:border-[#1F4068]"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1 block text-sm font-medium text-[#1F4068]">
              Senha
            </label>

            <input
              type="password"
              className="w-full rounded border border-gray-200 p-2 outline-none focus:border-[#1F4068]"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded bg-[#1F4068] py-2 text-white transition hover:bg-[#173553]"
          >
            Entrar
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Não tem conta? Cadastre-se
          </p>
        </div>
      </main>
    </div>
  )
}