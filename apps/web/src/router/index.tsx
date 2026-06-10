import { createBrowserRouter } from 'react-router-dom'

import { EmpresaLayout } from '@/layouts/EmpresaLayout'
import { UsuarioLayout } from '@/layouts/UsuarioLayout'
import { CadastroEmpresa } from '@/pages/empresa/CadastroEmpresa'

import { Login } from '@/pages/Login'
import { SelecaoPerfil } from '@/pages/SelecaoPerfil'


import { MinhasVagas } from '@/pages/empresa/MinhasVagas'
import { Candidatos } from '@/pages/empresa/Candidatos'
import { PerfilEmpresa } from '@/pages/empresa/Perfil'

import { Feed } from '@/pages/usuario/Feed'
import { Matches } from '@/pages/usuario/Matches'
import { PerfilUsuario } from '@/pages/usuario/Perfil'
import { CadastroHabilidade } from '@/pages/usuario/CadastroHabilidade'

export const router = createBrowserRouter([
  {
    path: '/empresa',
    element: <EmpresaLayout />,
    children: [
      { index: true, element: <MinhasVagas /> },
      { path: 'minhas-vagas', element: <MinhasVagas /> },
      { path: 'candidatos', element: <Candidatos /> },
      { path: 'perfil', element: <PerfilEmpresa /> },
      { path: 'cadastro', element: <CadastroEmpresa /> },
    ],
  },
  {
  path: '/',
  element: <SelecaoPerfil />,
},

{
  path: '/login',
  element: <Login />,
},

{
  path: '/usuario',
  element: <UsuarioLayout />,
  children: [
    { index: true, element: <Feed /> },
    { path: 'feed', element: <Feed /> },
    { path: 'matches', element: <Matches /> },
    { path: 'perfil', element: <PerfilUsuario /> },
    { path: 'cadastro-habilidade', element: <CadastroHabilidade /> }
  ],
},
])
