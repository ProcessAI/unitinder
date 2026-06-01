import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'

export function UsuarioLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar role="usuario" />
      <main className="flex-1 w-full max-w-6xl mx-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
