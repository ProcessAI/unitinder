import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import type { UserRole } from '@/types'
import logo from '@/assets/logo.png'

interface NavbarProps {
  role: UserRole
}

const usuarioLinks = [
  { label: 'Feed', to: '/feed' },
  { label: 'Matches', to: '/matches' },
  { label: 'Perfil', to: '/perfil' },
]

const empresaLinks = [
  { label: 'Minhas vagas', to: '/empresa/minhas-vagas' },
  { label: 'Candidatos', to: '/empresa/candidatos' },
  { label: 'Perfil', to: '/empresa/perfil' },
]

export function Navbar({ role }: NavbarProps) {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const links = role === 'empresa' ? empresaLinks : usuarioLinks

  function handleSair() {
    navigate('/')
    setMenuAberto(false)
  }

  function handleLinkClick() {
    setMenuAberto(false)
  }

  return (
    <header className="bg-white border-b border-[var(--color-border)] shadow-[var(--shadow-sm)] sticky top-0 z-50">
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 h-16">

        {/* Logo */}
        <NavLink
          to={role === 'empresa' ? '/empresa' : '/'}
          className="flex items-center gap-2"
        >
          <img src={logo} alt="UniTinder" className="w-20 h-20 object-contain" />
        </NavLink>

        {/* Links — desktop */}
        <ul className="hidden md:flex items-center gap-7 list-none">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-[var(--color-text)] font-semibold'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={handleSair}
              className="text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] px-4 py-1.5 rounded-lg hover:bg-[#c8eeea] transition-colors duration-150"
            >
              Sair
            </button>
          </li>
        </ul>

        {/* Botão hamburguer — mobile */}
        <button
          onClick={() => setMenuAberto((prev) => !prev)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
        >
          <span className={`block w-5 h-0.5 bg-[var(--color-text)] rounded transition-all duration-200 ${menuAberto ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--color-text)] rounded transition-all duration-200 ${menuAberto ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--color-text)] rounded transition-all duration-200 ${menuAberto ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

      </nav>

      {/* Menu mobile — dropdown */}
      {menuAberto && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white px-6 py-4 flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `text-sm font-medium py-3 px-3 rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary-light)] font-semibold'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-gray-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-2 pt-3 border-t border-[var(--color-border)]">
            <button
              onClick={handleSair}
              className="w-full text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] px-4 py-2.5 rounded-lg hover:bg-[#c8eeea] transition-colors duration-150"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
