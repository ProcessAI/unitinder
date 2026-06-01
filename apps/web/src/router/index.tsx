import { createBrowserRouter } from 'react-router-dom'

import { EmpresaLayout } from '@/layouts/EmpresaLayout'
import { UsuarioLayout } from '@/layouts/UsuarioLayout'

import { MinhasVagas } from '@/pages/empresa/MinhasVagas'
import { Candidatos } from '@/pages/empresa/Candidatos'
import { PerfilEmpresa } from '@/pages/empresa/Perfil'

import { Feed } from '@/pages/usuario/Feed'
import { Matches } from '@/pages/usuario/Matches'
import { PerfilUsuario } from '@/pages/usuario/Perfil'

export const router = createBrowserRouter([
  {
    path: '/empresa',
    element: <EmpresaLayout />,
    children: [
      { index: true, element: <MinhasVagas /> },
      { path: 'minhas-vagas', element: <MinhasVagas /> },
      { path: 'candidatos', element: <Candidatos /> },
      { path: 'perfil', element: <PerfilEmpresa /> },
    ],
  },
  {
    path: '/',
    element: <UsuarioLayout />,
    children: [
      { index: true, element: <Feed /> },
      { path: 'feed', element: <Feed /> },
      { path: 'matches', element: <Matches /> },
      { path: 'perfil', element: <PerfilUsuario /> },
    ],
  },
])
