import { useNavigate } from 'react-router-dom'
import logo from '@/assets/logo.png'

export function SelecaoPerfil() {
  const navigate = useNavigate()

  const selecionarPerfil = (perfil: 'usuario' | 'empresa') => {
    localStorage.setItem('tipoUsuario', perfil)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F1F5F7]">
      <header className="flex h-16 items-center justify-between bg-white px-10 shadow-sm">
        <img
          src={logo}
          alt="UniTinder"
          className="h-8"
        />

        <button className="rounded-md bg-[#C8F0E7] px-5 py-2 text-sm font-medium text-[#1F4068]">
          Sair
        </button>
      </header>

      <main className="flex flex-col items-center pt-20">
        <h1 className="mb-8 text-3xl font-bold text-[#1F4068]">
          Você é...
        </h1>

        <div className="flex gap-6">
          <button
            onClick={() => selecionarPerfil('usuario')}
            className="flex h-40 w-52 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <span className="text-4xl">🎓</span>

            <h2 className="mt-2 font-semibold text-[#1F4068]">
              Estagiário
            </h2>

            <p className="text-sm text-gray-500">
              Buscando vagas
            </p>
          </button>

          <button
            onClick={() => selecionarPerfil('empresa')}
            className="flex h-40 w-52 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <span className="text-4xl">🏢</span>

            <h2 className="mt-2 font-semibold text-[#1F4068]">
              Empresa
            </h2>

            <p className="text-sm text-gray-500">
              Publicando vagas
            </p>
          </button>
        </div>
      </main>
    </div>
  )
}