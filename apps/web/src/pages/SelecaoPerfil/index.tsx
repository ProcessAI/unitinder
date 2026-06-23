import { useNavigate } from 'react-router-dom'
import logo from '@/assets/logo.png'

export function SelecaoPerfil() {
  const navigate = useNavigate()

  const selecionarPerfil = (perfil: 'usuario' | 'empresa') => {
    localStorage.setItem('tipoUsuario', perfil)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <img
            src={logo}
            alt="UniTinder"
            className="h-20 w-20 object-contain"
          />
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-8 pt-20">
        <h1 className="mb-8 text-3xl font-bold text-[var(--color-text)]">
          Você é...
        </h1>

        <div className="flex flex-col gap-6 sm:flex-row">
          <button
            type="button"
            onClick={() => selecionarPerfil('usuario')}
            className="flex h-40 w-52 flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]"
          >
            <span className="text-4xl">🎓</span>

            <h2 className="mt-2 font-semibold text-[var(--color-text)]">
              Estagiário
            </h2>

            <p className="text-sm text-[var(--color-text-muted)]">
              Buscando vagas
            </p>
          </button>

          <button
            type="button"
            onClick={() => selecionarPerfil('empresa')}
            className="flex h-40 w-52 flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]"
          >
            <span className="text-4xl">🏢</span>

            <h2 className="mt-2 font-semibold text-[var(--color-text)]">
              Empresa
            </h2>

            <p className="text-sm text-[var(--color-text-muted)]">
              Publicando vagas
            </p>
          </button>
        </div>
      </main>
    </div>
  )
}
