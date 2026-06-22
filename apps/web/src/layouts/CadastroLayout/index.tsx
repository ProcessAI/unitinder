import { Outlet, useNavigate } from 'react-router-dom'
import logo from '@/assets/logo.png'

export function CadastroLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-[var(--color-border)] sticky top-0 z-50">
        <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 h-16">
          <img src={logo} alt="UniTinder" className="w-20 h-20 object-contain" />
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] px-4 py-1.5 rounded-lg hover:bg-[#c8eeea] transition-colors duration-150"
          >
            Sair
          </button>
        </nav>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}