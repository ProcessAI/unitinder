# UniTinder — Web App

Guia completo para quem vai trabalhar neste projeto. Leia antes de escrever qualquer linha de código.

---

## Índice

1. [Stack e decisões técnicas](#1-stack-e-decisões-técnicas)
2. [Como rodar o projeto](#2-como-rodar-o-projeto)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Rotas disponíveis](#4-rotas-disponíveis)
5. [Como usar o Tailwind CSS](#5-como-usar-o-tailwind-css)
6. [Cores e variáveis do projeto](#6-cores-e-variáveis-do-projeto)
7. [Tipos (TypeScript)](#7-tipos-typescript)
8. [Componentes prontos](#8-componentes-prontos)
9. [Como criar uma nova página](#9-como-criar-uma-nova-página)
10. [Como criar um novo componente](#10-como-criar-um-novo-componente)
11. [Como adicionar uma nova rota](#11-como-adicionar-uma-nova-rota)
12. [Regras e convenções](#12-regras-e-convenções)
13. [Mapa de responsabilidades](#13-mapa-de-responsabilidades)
14. [Integração com a API](#14-integração-com-a-api)

---

## 1. Stack e decisões técnicas

| O quê | Escolha | Por quê |
|---|---|---|
| Framework | React 18 + TypeScript | Tipagem forte, ecossistema maduro |
| Build tool | Vite | Dev server rápido, HMR instantâneo |
| Estilos | Tailwind CSS v4 | Classes utilitárias direto no JSX, fácil de aprender, sem arquivos de estilo extras |
| Roteamento | React Router v6 | Roteamento declarativo com suporte a layouts aninhados |

**Por que Tailwind?**
- Você escreve o estilo direto no elemento, sem criar arquivo separado nem inventar nome de classe
- Quem já sabe CSS entende na hora: `flex` = `display: flex`, `p-4` = `padding: 1rem`, `text-lg` = fonte grande
- A documentação é excelente — qualquer dúvida, busca no [tailwindcss.com](https://tailwindcss.com)
- Sem risco de conflito de estilos entre componentes

---

## 2. Como rodar o projeto

```bash
# Dentro de apps/web
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

Outros comandos:

```bash
npm run build    # gera build de produção em dist/
npm run preview  # serve o build de produção localmente
```

---

## 3. Estrutura de pastas

```
apps/web/
├── index.html                  # HTML raiz — não editar
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── assets/                 # Imagens, ícones, fontes
    │   └── logo.png
    │
    ├── components/             # Componentes reutilizáveis (usados em várias páginas)
    │   ├── Navbar/
    │   │   └── index.tsx       ← menu de navegação
    │   └── Alert/
    │       └── index.tsx       ← alertas de sucesso e erro
    │
    ├── layouts/                # Estrutura base de cada perfil (Navbar + área de conteúdo)
    │   ├── EmpresaLayout/
    │   │   └── index.tsx
    │   └── UsuarioLayout/
    │       └── index.tsx
    │
    ├── pages/                  # Uma pasta por página, organizada por perfil
    │   ├── empresa/
    │   │   ├── MinhasVagas/
    │   │   │   └── index.tsx   ← edite aqui o conteúdo da página
    │   │   ├── Candidatos/
    │   │   │   └── index.tsx
    │   │   └── Perfil/
    │   │       └── index.tsx
    │   └── usuario/
    │       ├── Feed/
    │       │   └── index.tsx
    │       ├── Matches/
    │       │   └── index.tsx
    │       └── Perfil/
    │           └── index.tsx
    │
    ├── router/
    │   └── index.tsx           # Definição de todas as rotas
    │
    ├── styles/
    │   └── global.css          # Tailwind + variáveis de cor e fonte do projeto
    │
    ├── types/
    │   └── index.ts            # Todos os tipos TypeScript do projeto
    │
    └── main.tsx                # Ponto de entrada — não editar
```

### Regra de ouro para pastas

> Cada pasta dentro de `components/` ou `pages/` representa **um único componente ou página**.  
> Ela sempre terá pelo menos um `index.tsx`.  
> Nunca coloque dois componentes no mesmo arquivo.

---

## 4. Rotas disponíveis

### Fora dos layouts (sem menu)

| Rota | Componente | Arquivo |
|---|---|---|
| `/` | SelecaoPerfil | `src/pages/SelecaoPerfil/index.tsx` |
| `/login` | Login | `src/pages/Login/index.tsx` |

### Perfil Usuário (estagiário)

| Rota | Componente | Arquivo |
|---|---|---|
| `/usuario` | Feed | `src/pages/usuario/Feed/index.tsx` |
| `/usuario/feed` | Feed | `src/pages/usuario/Feed/index.tsx` |
| `/usuario/matches` | Matches | `src/pages/usuario/Matches/index.tsx` |
| `/usuario/perfil` | PerfilUsuario | `src/pages/usuario/Perfil/index.tsx` |

### Perfil Empresa

| Rota | Componente | Arquivo |
|---|---|---|
| `/empresa` | MinhasVagas | `src/pages/empresa/MinhasVagas/index.tsx` |
| `/empresa/minhas-vagas` | MinhasVagas | `src/pages/empresa/MinhasVagas/index.tsx` |
| `/empresa/candidatos` | Candidatos | `src/pages/empresa/Candidatos/index.tsx` |
| `/empresa/perfil` | PerfilEmpresa | `src/pages/empresa/Perfil/index.tsx` |
| `/empresa/cadastro` | CadastroEmpresa | `src/pages/empresa/CadastroEmpresa/index.tsx` |

Todas as rotas de usuário usam o `UsuarioLayout` (menu de usuário).  
Todas as rotas de empresa usam o `EmpresaLayout` (menu de empresa).

> Ainda não existe uma tela de cadastro para estagiário — está sendo feita por outro desenvolvedor.

---

## 5. Como usar o Tailwind CSS

O Tailwind funciona com classes utilitárias direto no `className` do elemento. Cada classe faz uma coisa só.

### Referência rápida das classes mais usadas

**Layout**
```
flex          → display: flex
flex-col      → flex-direction: column
items-center  → align-items: center
justify-between → justify-content: space-between
gap-4         → gap: 1rem
grid          → display: grid
grid-cols-3   → grid-template-columns: repeat(3, 1fr)
```

**Espaçamento** (escala: 1 = 0.25rem, 4 = 1rem, 8 = 2rem)
```
p-4           → padding: 1rem (todos os lados)
px-6          → padding esquerda e direita: 1.5rem
py-3          → padding cima e baixo: 0.75rem
mt-4          → margin-top: 1rem
mb-2          → margin-bottom: 0.5rem
mx-auto       → margin esquerda e direita: auto (centraliza)
```

**Tamanho**
```
w-full        → width: 100%
w-64          → width: 16rem
max-w-xl      → max-width: 36rem
h-16          → height: 4rem
min-h-screen  → min-height: 100vh
```

**Tipografia**
```
text-sm       → font-size: 0.875rem
text-base     → font-size: 1rem
text-lg       → font-size: 1.125rem
text-xl       → font-size: 1.25rem
text-2xl      → font-size: 1.5rem
font-normal   → font-weight: 400
font-medium   → font-weight: 500
font-semibold → font-weight: 600
font-bold     → font-weight: 700
```

**Cores** (use as variáveis do projeto — veja seção 6)
```
text-[var(--color-text)]       → cor do texto
bg-[var(--color-primary)]      → cor de fundo
border-[var(--color-border)]   → cor da borda
```

**Bordas**
```
border         → border: 1px solid
border-2       → border: 2px solid
rounded        → border-radius: 0.25rem
rounded-lg     → border-radius: 0.5rem
rounded-xl     → border-radius: 0.75rem
rounded-full   → border-radius: 9999px
```

**Sombra**
```
shadow-sm   → sombra leve
shadow      → sombra padrão
shadow-md   → sombra média
shadow-lg   → sombra grande
```

**Estados (hover, focus)**
```
hover:bg-gray-100   → muda cor ao passar o mouse
focus:outline-none  → remove outline no foco
transition          → ativa transição suave
duration-150        → duração da transição: 150ms
```

### Exemplo prático — card de vaga

```tsx
export function CardVaga() {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm p-6 flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-[var(--color-text)]">
        Desenvolvedor Frontend
      </h2>
      <p className="text-sm text-[var(--color-text-muted)]">
        Empresa XYZ · São Paulo, SP
      </p>
      <button className="mt-2 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition duration-150">
        Ver vaga
      </button>
    </div>
  )
}
```

### Classes condicionais (quando o estilo muda com base em uma variável)

```tsx
// Usando template string
<div className={`px-4 py-2 rounded-lg ${isAtivo ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600'}`}>

// Usando array + join (mais legível quando há muitas classes)
<div className={[
  'px-4 py-2 rounded-lg font-medium',
  isAtivo ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600',
].join(' ')}>
```

### O que NÃO fazer

```tsx
// ❌ Nunca use estilo inline para layout
<div style={{ display: 'flex', gap: '1rem' }}>

// ❌ Não crie classes CSS avulsas em arquivos separados
// Use as classes do Tailwind direto no className
```

---

## 6. Cores e variáveis do projeto

Definidas em `src/styles/global.css`. Use dentro do `className` com a sintaxe `[var(--nome)]`.

### Cores disponíveis

| Variável | Valor | Uso |
|---|---|---|
| `--color-primary` | `#2DB8A8` | Botões principais, links ativos, destaques |
| `--color-primary-light` | `#E8F7F5` | Fundo suave de elementos com primary |
| `--color-primary-dark` | `#1f8c7e` | Hover de botões primários |
| `--color-text` | `#1A1A2E` | Texto principal |
| `--color-text-muted` | `#6B7280` | Texto secundário, legendas |
| `--color-bg` | `#F9FAFB` | Fundo da página |
| `--color-white` | `#FFFFFF` | Fundo de cards e painéis |
| `--color-border` | `#E5E7EB` | Bordas suaves |
| `--color-success` | `#10B981` | Ícones e indicadores de sucesso |
| `--color-error` | `#EF4444` | Ícones e indicadores de erro |

### Como usar no className

```tsx
<div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-xl">
  <h1 className="text-[var(--color-text)] font-bold">Título</h1>
  <p className="text-[var(--color-text-muted)]">Subtítulo</p>
  <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
    Ação
  </button>
</div>
```

---

## 7. Tipos (TypeScript)

Todos os tipos ficam em `src/types/index.ts`. Importe sempre com o alias `@/types`.

### Tipos disponíveis

```ts
UserRole   // 'usuario' | 'empresa'
User       // id, name, email, role, avatarUrl?
Company    // id, name, email, role, logoUrl?, description?
Job        // id, title, description, companyId, companyName, location, createdAt
Match      // id, jobId, userId, status, createdAt
AlertProps // type ('success' | 'error'), message, onClose?
```

### Como importar

```ts
import type { User, Job } from '@/types'
```

### Como adicionar um novo tipo

Abra `src/types/index.ts` e adicione no final. Não crie arquivos de tipos separados.

---

## 8. Componentes prontos

### Navbar

Exibido automaticamente pelos layouts. Você **não precisa** adicionar o `<Navbar>` nas páginas — ele já está no layout.

O menu muda automaticamente dependendo do perfil:
- Rotas `/empresa/*` → menu de empresa (Minhas vagas, Candidatos, Perfil, Sair)
- Demais rotas → menu de usuário (Feed, Matches, Perfil, Sair)

### Alert

Componente de aviso de sucesso ou erro.

```tsx
import { Alert } from '@/components/Alert'

// Sucesso
<Alert type="success" message="Vaga publicada com sucesso!" />

// Erro
<Alert type="error" message="Ocorreu um erro. Tente novamente." />

// Com botão de fechar
<Alert
  type="success"
  message="Candidatura enviada!"
  onClose={() => setAlerta(null)}
/>
```

#### Exemplo com estado

```tsx
import { useState } from 'react'
import { Alert } from '@/components/Alert'

export function MinhasVagas() {
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function handlePublicar() {
    // ... lógica
    setAlerta({ type: 'success', message: 'Vaga publicada!' })
  }

  return (
    <div className="flex flex-col gap-4">
      {alerta && (
        <Alert
          type={alerta.type}
          message={alerta.message}
          onClose={() => setAlerta(null)}
        />
      )}
      <button
        onClick={handlePublicar}
        className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium"
      >
        Publicar vaga
      </button>
    </div>
  )
}
```

---

## 9. Como criar uma nova página

**1. Crie a pasta dentro do perfil correto**

```
src/pages/empresa/NomeDaPagina/
src/pages/usuario/NomeDaPagina/
```

**2. Crie o arquivo `index.tsx`**

```tsx
export function NomeDaPagina() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">
        Título da página
      </h1>
      {/* conteúdo aqui */}
    </div>
  )
}
```

**3. Registre a rota** em `src/router/index.tsx`.

---

## 10. Como criar um novo componente

Componentes reutilizáveis ficam em `src/components/`.

```
src/components/NomeDoComponente/
└── index.tsx
```

**Regra:** se um componente é usado em apenas uma página, pode ficar dentro da pasta daquela página. Se é usado em duas ou mais, vai para `src/components/`.

---

## 11. Como adicionar uma nova rota

Abra `src/router/index.tsx` e adicione dentro do layout correto.

### Para empresa

```tsx
import { NovaPagina } from '@/pages/empresa/NovaPagina'

// Dentro do bloco path: '/empresa'
{ path: 'nova-pagina', element: <NovaPagina /> },
```

URL resultante: `/empresa/nova-pagina`

### Para usuário

```tsx
import { NovaPagina } from '@/pages/usuario/NovaPagina'

// Dentro do bloco path: '/'
{ path: 'nova-pagina', element: <NovaPagina /> },
```

URL resultante: `/nova-pagina`

---

## 12. Regras e convenções

### Nomenclatura

| O quê | Convenção | Exemplo |
|---|---|---|
| Componentes e páginas | PascalCase | `MinhasVagas`, `CardVaga` |
| Arquivo de componente | sempre `index.tsx` | — |
| Funções e variáveis | camelCase | `handleSubmit`, `vagaAtiva` |
| Tipos e interfaces | PascalCase | `UserRole`, `Job` |

### Imports — use sempre o alias `@/`

```ts
// ✅ correto
import { Alert } from '@/components/Alert'
import type { Job } from '@/types'

// ❌ evitar
import { Alert } from '../../../components/Alert'
```

### Exports nomeados, não default

```ts
// ✅ correto
export function Feed() { ... }

// ❌ evitar
export default function Feed() { ... }
```

---

## 13. Mapa de responsabilidades

| Tarefa | Arquivo(s) a editar |
|---|---|
| Editar o conteúdo de uma página | `src/pages/[perfil]/[NomePagina]/index.tsx` |
| Mudar itens ou estilo do menu | `src/components/Navbar/index.tsx` |
| Mudar cores globais do projeto | `src/styles/global.css` |
| Adicionar ou editar tipos | `src/types/index.ts` |
| Adicionar uma nova rota | `src/router/index.tsx` |
| Adicionar uma nova página | Criar pasta em `src/pages/`, depois registrar em `src/router/index.tsx` |
| Criar um componente reutilizável | Criar pasta em `src/components/` |
| Adicionar imagens ou ícones | Colocar em `src/assets/` e importar no `index.tsx` |
| Mudar o título da aba do browser | `index.html` (tag `<title>`) |
| Instalar uma nova dependência | `npm install [pacote]` dentro de `apps/web/` |

---

## 14. Integração com a API

Todo acesso ao backend passa por `src/lib/api.ts` — não use `fetch` direto nas páginas.

```ts
import { api, getSession, saveSession, ApiError } from '@/lib/api'
```

### O que tem lá

| Função | Para quê |
|---|---|
| `api.login(identificador, senha)` | E-mail (estagiário) ou CNPJ (empresa) + senha |
| `api.registroEmpresa(dados)` / `api.registroUsuario(dados)` | Cadastro |
| `api.listarVagas(filtro?)` | Feed (estagiário) e Minhas vagas (empresa) |
| `api.criarVaga(dados)` / `api.encerrarVaga(id)` | Publicar/encerrar vaga |
| `api.criarMatch(idEstagiario, idVaga)` | Estagiário demonstra interesse numa vaga |
| `api.listarMatchesPorEstagiario(id)` | Tela de Matches do estagiário |
| `api.listarCandidatosPorVaga(id)` | Tela de Candidatos da empresa |
| `api.atualizarStatusMatch(idMatch, status)` | Empresa aceita/recusa candidatura |

Todas essas funções já tratam erro lançando `ApiError` (com `.message` pronto pra mostrar no `Alert`) e já enviam o token JWT salvo automaticamente.

### Sessão (login)

Depois de um login/cadastro bem-sucedido, salve a sessão:

```ts
saveSession({ token, role: 'estagiario' | 'empresa', id })
```

Para ler a sessão atual (ex.: pegar o id do estagiário/empresa logado):

```ts
const session = getSession() // null se não estiver logado
```

### Variável de ambiente

A URL da API vem de `VITE_API_URL` (default: `http://localhost:3333`). Para mudar, copie `.env.example` para `.env` na raiz de `apps/web` e ajuste o valor.

### Exemplo de uso numa página

```tsx
import { useEffect, useState } from 'react'
import { api, getSession, ApiError } from '@/lib/api'

const session = getSession()

useEffect(() => {
  if (!session) return

  api.listarMatchesPorEstagiario(session.id)
    .then(setMatches)
    .catch((error) => {
      setAlerta({ type: 'error', message: error instanceof ApiError ? error.message : 'Erro inesperado.' })
    })
}, [])
```
