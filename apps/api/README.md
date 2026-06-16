# UniTinder — API

Guia completo para quem vai trabalhar neste projeto. Leia antes de escrever qualquer linha de código.

---

## Índice

1. [Stack e decisões técnicas](#1-stack-e-decisões-técnicas)
2. [Como rodar o projeto](#2-como-rodar-o-projeto)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Banco de dados — modelo e tabelas](#4-banco-de-dados--modelo-e-tabelas)
5. [Rotas disponíveis](#5-rotas-disponíveis)
6. [Tipos (TypeScript)](#6-tipos-typescript)
7. [Como implementar um controller](#7-como-implementar-um-controller)
8. [Como adicionar uma nova rota](#8-como-adicionar-uma-nova-rota)
9. [Autenticação](#9-autenticação)
10. [Regras e convenções](#10-regras-e-convenções)
11. [Mapa de responsabilidades](#11-mapa-de-responsabilidades)

---

## 1. Stack e decisões técnicas

| O quê | Escolha | Por quê |
|---|---|---|
| Runtime | Node.js | Ecossistema amplo, fácil integração com TypeScript |
| Framework | Express | Minimalista, flexível, amplamente conhecido |
| Linguagem | TypeScript | Tipagem forte, consistência com o frontend |
| Autenticação | JWT + bcryptjs | Stateless, sem necessidade de sessão no servidor |
| Banco de dados | PostgreSQL (modelagem já definida) | Relacional, adequado para as relações do projeto |
| Variáveis de ambiente | dotenv | Separação de configuração sensível do código |

---

## 2. Como rodar o projeto

```bash
# Dentro de apps/api
npm install

# Copie o arquivo de exemplo e preencha as variáveis
cp .env.example .env

# Rode em modo desenvolvimento (reinicia automaticamente ao salvar)
npm run dev
```

A API sobe em `http://localhost:3333`.

Outros comandos:

```bash
npm run build   # compila TypeScript para a pasta dist/
npm start       # roda o código compilado (produção)
```

### Variáveis de ambiente (`.env`)

```env
PORT=3333
JWT_SECRET=sua_chave_secreta_aqui
```

> Nunca suba o arquivo `.env` para o repositório. Ele já está no `.gitignore`.

---

## 3. Estrutura de pastas

```
apps/api/
├── .env.example              # modelo das variáveis de ambiente
├── package.json
├── tsconfig.json
└── src/
    ├── server.ts             # ponto de entrada — inicia o servidor
    ├── app.ts                # configura o express e registra as rotas
    │
    ├── types/
    │   └── index.ts          # todos os tipos TypeScript do projeto
    │
    ├── middlewares/
    │   └── auth.middleware.ts # valida o JWT nas rotas protegidas
    │
    ├── routes/               # define quais URLs existem e qual controller responde
    │   ├── auth.routes.ts
    │   ├── usuario.routes.ts
    │   ├── empresa.routes.ts
    │   ├── estagiario.routes.ts
    │   ├── vaga.routes.ts
    │   ├── match.routes.ts
    │   └── habilidade.routes.ts
    │
    └── controllers/          # implementa a lógica de cada rota
        ├── auth.controller.ts
        ├── usuario.controller.ts
        ├── empresa.controller.ts
        ├── estagiario.controller.ts
        ├── vaga.controller.ts
        ├── match.controller.ts
        └── habilidade.controller.ts
```

### Regra de ouro para pastas

> Cada controller corresponde a uma entidade do banco.  
> Cada rota aponta para um método do controller.  
> Nunca coloque lógica de negócio direto no arquivo de rotas.

---

## 4. Banco de dados — modelo e tabelas

O banco é PostgreSQL. A modelagem foi feita separadamente (arquivo PDF de referência). Abaixo estão todas as tabelas com seus campos e o que cada uma representa.

---

### `usuario`

Conta de acesso. Todo mundo tem um — seja estagiário, seja empresa.

| Campo | Tipo | Descrição |
|---|---|---|
| `id_usuario` | serial | PK |
| `usuario_nome` | varchar(100) | |
| `usuario_email` | text | único |
| `usuario_senha` | varchar(255) | senha com hash |
| `usuario_status` | char(1) | ex: `A` (ativo), `I` (inativo) |
| `usuario_created_at` | timestamptz | |
| `usuario_update_at` | timestamptz | |
| `id_empresa_empresa` | integer | FK → empresa (se for empresa) |
| `id_estagiario_estagiario` | integer | FK → estagiario (se for estagiário) |

---

### `empresa`

Perfil completo de uma empresa.

| Campo | Tipo | Descrição |
|---|---|---|
| `id_empresa` | serial | PK |
| `empresa_cnpj` | char(14) | |
| `empresa_nome` | varchar(255) | |
| `empresa_setor` | varchar(150) | área de atuação |
| `empresa_cidade` | varchar(150) | |
| `empresa_descricao` | text | opcional |
| `empresa_status` | char(1) | `A` ou `I` |
| `empresa_created_at` | timestamptz | |
| `empresa_updated_at` | timestamptz | |

---

### `estagiario`

Perfil completo de um candidato (estagiário).

| Campo | Tipo | Descrição |
|---|---|---|
| `id_estagiario` | serial | PK |
| `estagiario_email` | varchar(255) | |
| `estagiario_senha_hash` | varchar(255) | senha com hash |
| `estagiario_nome_completo` | varchar(150) | |
| `estagiario_cpf` | char(11) | |
| `estagiario_data_nascimento` | date | |
| `estagiario_telefone` | varchar(20) | opcional |
| `estagiario_foto_perfil_url` | text | opcional |
| `estagiario_cidade` | varchar(100) | opcional |
| `estagiario_estado` | char(2) | ex: `SP`, `RJ` |
| `estagiario_disponivel_remoto` | boolean | opcional |
| `estagiario_instituicao` | varchar(150) | faculdade |
| `estagiario_curso` | varchar(100) | |
| `estagiario_semestre_atual` | smallint | |
| `estagiario_previsao_formatura` | date | |
| `estagiario_turno` | varchar(10) | ex: `manhã`, `noite` |
| `estagiario_area_interesse` | varchar(100) | |
| `estagiario_nivel_experiencia` | varchar(20) | ex: `iniciante`, `intermediário` |
| `estagiario_cv_url` | text | link do currículo |
| `estagiario_linkedin_url` | text | |
| `estagiario_portfolio_url` | text | |
| `estagiario_bio` | text | apresentação pessoal |
| `estagiario_modalidade_preferida` | varchar(20) | `remoto`, `presencial`, `híbrido` |
| `estagiario_carga_horaria_preferida` | smallint | horas por semana |
| `estagiario_aceita_bolsa_minima` | boolean | |
| `estagiario_ativo` | boolean | |
| `estagiario_perfil_completo` | boolean | indica se preencheu tudo |
| `estagiario_created_at` | timestamptz | |
| `estagiario_update_at` | timestamptz | |

---

### `vagas`

Vaga publicada por uma empresa.

| Campo | Tipo | Descrição |
|---|---|---|
| `id_vaga` | serial | PK |
| `vaga_titulo` | varchar(150) | |
| `vaga_descricao` | varchar(150) | |
| `vaga_area` | varchar(80) | área de atuação |
| `vaga_localidade` | varchar(120) | |
| `vaga_modelo_trabalho` | varchar(20) | `remoto`, `presencial`, `híbrido` |
| `vaga_tipo_contrato` | varchar(20) | `estágio`, `CLT`, etc. |
| `vaga_nivel` | varchar(20) | `júnior`, `pleno`, etc. |
| `vaga_qtd_vagas` | integer | quantidade de vagas |
| `vaga_pcd` | boolean | aceita PCD |
| `vaga_salario_min` | decimal(10,2) | opcional |
| `vaga_salario_max` | decimal(10,2) | opcional |
| `vaga_beneficios` | text | opcional |
| `vaga_carga_horaria` | varchar(30) | ex: `20h semanais` |
| `vaga_escolaridade_minima` | varchar(40) | opcional |
| `vaga_experiencia_minima` | varchar(40) | opcional |
| `vaga_prazo_candidatura` | date | data limite |
| `vaga_status` | char(1) | `A` (aberta), `F` (fechada) |
| `vaga_data_publicacao` | timestamptz | |
| `vaga_created_at` | timestamptz | |
| `vaga_updated_at` | timestamptz | |
| `id_empresa_empresa` | integer | FK → empresa |

---

### `match`

Candidatura de um estagiário a uma vaga.

| Campo | Tipo | Descrição |
|---|---|---|
| `id_match` | serial | PK |
| `match_created_at` | timestamptz | data da candidatura |
| `match_status` | varchar(20) | `pending`, `accepted`, `rejected` |
| `id_estagiario_estagiario` | integer | FK → estagiario |
| `id_vaga_vagas` | integer | FK → vagas |

---

### `habilidade`

Catálogo de habilidades disponíveis no sistema.

| Campo | Tipo | Descrição |
|---|---|---|
| `id_habilidade` | serial | PK |
| `habilidade_nome` | varchar(255) | ex: `React`, `Python` |
| `habilidade_tipo` | varchar(100) | ex: `técnica`, `comportamental` |
| `habilidade_nivel` | char(1) | ex: `B` (básico), `I` (intermediário), `A` (avançado) |
| `habilidade_descricao` | text | opcional |

---

### `rl_vaga_habilidade`

Tabela de relacionamento: quais habilidades uma vaga exige.

| Campo | Tipo | Descrição |
|---|---|---|
| `id_vaga_habilidade` | serial | PK |
| `id_vaga` | integer | FK → vagas |
| `id_habilidade` | integer | FK → habilidade |

---

### `rl_estagiario_habilidade`

Tabela de relacionamento: quais habilidades um estagiário tem.

| Campo | Tipo | Descrição |
|---|---|---|
| `id_estagiario_habilidade` | serial | PK |
| `id_estagiario` | integer | FK → estagiario |
| `id_habilidade` | integer | FK → habilidade |

---

## 5. Rotas disponíveis

### Auth

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login de qualquer tipo de usuário |
| POST | `/auth/registro/usuario` | Cria conta de usuário genérico |
| POST | `/auth/registro/empresa` | Cria conta + perfil de empresa |

---

### Usuários (`/usuarios`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/usuarios` | Lista todos os usuários |
| GET | `/usuarios/:id` | Busca um usuário pelo id |
| PUT | `/usuarios/:id` | Atualiza dados do usuário |
| DELETE | `/usuarios/:id` | Remove um usuário |

---

### Empresas (`/empresas`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/empresas` | Lista todas as empresas |
| GET | `/empresas/:id` | Busca uma empresa pelo id |
| PUT | `/empresas/:id` | Atualiza perfil da empresa |
| DELETE | `/empresas/:id` | Remove uma empresa |

---

### Estagiários (`/estagiarios`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/estagiarios` | Lista todos os estagiários |
| GET | `/estagiarios/:id` | Busca um estagiário pelo id |
| PUT | `/estagiarios/:id` | Atualiza perfil do estagiário |
| DELETE | `/estagiarios/:id` | Remove um estagiário |
| GET | `/estagiarios/:id/habilidades` | Lista habilidades do estagiário |
| POST | `/estagiarios/:id/habilidades` | Vincula habilidade ao estagiário |
| DELETE | `/estagiarios/:id/habilidades/:habilidadeId` | Remove habilidade do estagiário |

---

### Vagas (`/vagas`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/vagas` | Lista todas as vagas |
| GET | `/vagas/:id` | Busca uma vaga pelo id |
| POST | `/vagas` | Cria uma nova vaga |
| PUT | `/vagas/:id` | Atualiza uma vaga |
| DELETE | `/vagas/:id` | Remove uma vaga |
| GET | `/vagas/:id/habilidades` | Lista habilidades exigidas pela vaga |
| POST | `/vagas/:id/habilidades` | Vincula habilidade à vaga |
| DELETE | `/vagas/:id/habilidades/:habilidadeId` | Remove habilidade da vaga |

---

### Matches (`/matches`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/matches` | Lista todos os matches |
| GET | `/matches/:id` | Busca um match pelo id |
| GET | `/matches/estagiario/:estagiarioId` | Matches de um estagiário |
| GET | `/matches/vaga/:vagaId` | Candidatos de uma vaga |
| POST | `/matches` | Estagiário se candidata a uma vaga |
| PATCH | `/matches/:id/status` | Empresa aceita ou rejeita candidatura |
| DELETE | `/matches/:id` | Remove um match |

---

### Habilidades (`/habilidades`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/habilidades` | Lista todas as habilidades |
| GET | `/habilidades/:id` | Busca uma habilidade pelo id |
| POST | `/habilidades` | Cria uma nova habilidade |
| PUT | `/habilidades/:id` | Atualiza uma habilidade |
| DELETE | `/habilidades/:id` | Remove uma habilidade |

---

## 6. Tipos (TypeScript)

Todos os tipos ficam em `src/types/index.ts`. Importe diretamente de lá.

### Tipos disponíveis

```ts
UsuarioRole              // 'estagiario' | 'empresa'
MatchStatus              // 'pending' | 'accepted' | 'rejected'
Usuario                  // conta de acesso (login)
Empresa                  // perfil da empresa
Estagiario               // perfil do candidato
Vaga                     // vaga publicada por empresa
Match                    // candidatura de estagiário a vaga
Habilidade               // item do catálogo de habilidades
RlVagaHabilidade         // vínculo vaga ↔ habilidade
RlEstagiarioHabilidade   // vínculo estagiário ↔ habilidade
```

### Como importar

```ts
import type { Estagiario, Vaga, Match } from '../types'
```

### Como adicionar um novo tipo

Abra `src/types/index.ts` e adicione no final. Não crie arquivos de tipos separados.

---

## 7. Como implementar um controller

Os controllers já estão criados com os métodos vazios. Você só precisa preencher a lógica dentro de cada método.

### Estrutura padrão de um método

```ts
listar: async (req: Request, res: Response) => {
  // 1. Busca os dados no banco
  // 2. Retorna com res.json()
  // 3. Em caso de erro, usa res.status(500).json({ error: 'mensagem' })
}
```

### Exemplo — buscar por id

```ts
buscarPorId: async (req: Request, res: Response) => {
  const { id } = req.params
  // busca no banco pelo id
  // se não encontrar: res.status(404).json({ error: 'Não encontrado' })
  // se encontrar: res.json(resultado)
}
```

### Exemplo — criar

```ts
criar: async (req: Request, res: Response) => {
  const dados = req.body
  // valida os campos obrigatórios
  // insere no banco
  // retorna o registro criado com status 201
  res.status(201).json(novoRegistro)
}
```

### Exemplo — atualizar status (PATCH)

```ts
atualizarStatus: async (req: Request, res: Response) => {
  const { id } = req.params
  const { status } = req.body // 'accepted' | 'rejected'
  // atualiza o campo match_status no banco
  // retorna o registro atualizado
}
```

---

## 8. Como adicionar uma nova rota

**1. Crie o método no controller correspondente**

```ts
// src/controllers/vaga.controller.ts
novaAcao: async (req: Request, res: Response) => {},
```

**2. Registre a rota no arquivo de rotas**

```ts
// src/routes/vaga.routes.ts
router.get('/caminho', VagaController.novaAcao)
```

**3. Se for uma entidade completamente nova:**

- Crie `src/controllers/novaEntidade.controller.ts`
- Crie `src/routes/novaEntidade.routes.ts`
- Importe e registre em `src/app.ts`:

```ts
import novaEntidadeRoutes from './routes/novaEntidade.routes'
app.use('/nova-entidade', novaEntidadeRoutes)
```

---

## 9. Autenticação

A autenticação usa **JWT (JSON Web Token)**. O fluxo é:

1. O cliente faz `POST /auth/login` com email e senha
2. A API valida as credenciais e devolve um `token`
3. Nas próximas requisições, o cliente envia o token no header:
   ```
   Authorization: Bearer <token>
   ```
4. O middleware `auth.middleware.ts` valida o token e libera (ou bloca) o acesso

### Middleware de autenticação

O arquivo `src/middlewares/auth.middleware.ts` deve ser usado nas rotas que precisam de login.

```ts
// Exemplo de uso em uma rota protegida
import { authMiddleware } from '../middlewares/auth.middleware'

router.post('/', authMiddleware, VagaController.criar)
```

### Senhas

Nunca salve senhas em texto puro. Use `bcryptjs` para fazer o hash antes de salvar e para comparar no login.

```ts
import bcrypt from 'bcryptjs'

// Ao cadastrar
const hash = await bcrypt.hash(senha, 10)

// Ao fazer login
const senhaCorreta = await bcrypt.compare(senhaDigitada, hashSalvo)
```

---

## 10. Regras e convenções

### Nomenclatura

| O quê | Convenção | Exemplo |
|---|---|---|
| Arquivos de rota | camelCase + `.routes.ts` | `vaga.routes.ts` |
| Arquivos de controller | camelCase + `.controller.ts` | `vaga.controller.ts` |
| Métodos do controller | camelCase | `buscarPorId`, `atualizarStatus` |
| Variáveis e funções | camelCase | `vagaId`, `handleCriar` |
| Tipos e interfaces | PascalCase | `Vaga`, `MatchStatus` |
| Campos do banco | snake_case (igual ao banco) | `vaga_titulo`, `id_empresa` |

### Padrão de resposta HTTP

| Situação | Status |
|---|---|
| Leitura bem-sucedida | `200 OK` |
| Criação bem-sucedida | `201 Created` |
| Não encontrado | `404 Not Found` |
| Dados inválidos | `400 Bad Request` |
| Sem autenticação | `401 Unauthorized` |
| Sem permissão | `403 Forbidden` |
| Erro interno | `500 Internal Server Error` |

### Formato de resposta de erro

```json
{ "error": "Mensagem descritiva do problema" }
```

---

## 11. Mapa de responsabilidades

| Tarefa | Arquivo(s) a editar |
|---|---|
| Implementar lógica de login | `src/controllers/auth.controller.ts` |
| Implementar CRUD de estagiários | `src/controllers/estagiario.controller.ts` |
| Implementar CRUD de empresas | `src/controllers/empresa.controller.ts` |
| Implementar CRUD de vagas | `src/controllers/vaga.controller.ts` |
| Implementar candidatura (match) | `src/controllers/match.controller.ts` |
| Implementar catálogo de habilidades | `src/controllers/habilidade.controller.ts` |
| Proteger uma rota com JWT | Adicionar `authMiddleware` na rota em `src/routes/*.routes.ts` |
| Adicionar ou editar tipos | `src/types/index.ts` |
| Registrar uma nova rota | `src/routes/*.routes.ts` + `src/app.ts` |
| Mudar porta ou variável de ambiente | `.env` |
| Instalar uma nova dependência | `npm install [pacote]` dentro de `apps/api/` |

---

## 12. Banco de dados real (Docker + Prisma)

O schema do Prisma (`prisma/schema.prisma`) espelha exatamente o `infra/Unitinder.sql`. O acesso ao banco é feito via `src/lib/prisma.ts` (`PrismaClient` singleton) — nenhum controller usa SQL solto.

```bash
# Sobe Postgres de desenvolvimento (porta 5432) e de testes (porta 5433),
# ambos já inicializados com o schema de infra/Unitinder.sql
cd infra
docker compose up -d

# Na primeira vez (ou após mudar o schema.prisma)
cd ../apps/api
cp .env.example .env   # ajuste o DATABASE_URL se necessário
npx prisma generate
```

Se o `schema.prisma` for alterado, confira que ele continua equivalente ao `infra/Unitinder.sql` com:

```bash
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script
```

## 13. Login e CNPJ da empresa

- **Estagiário** loga com `identificador` = e-mail.
- **Empresa** loga com `identificador` = CNPJ (qualquer formatação — `00.000.000/0001-00` ou só números). O backend remove a máscara, exige **14 dígitos** e valida os dígitos verificadores antes de cadastrar ou autenticar (`src/utils/cnpj.ts`).
- `POST /auth/login` recebe `{ identificador, senha }`: se o identificador tiver 14 dígitos numéricos, o login busca a empresa por CNPJ; caso contrário, busca o estagiário por e-mail.

## 14. Testes automatizados

Os testes (Vitest + Supertest) rodam contra o Postgres real de testes (`unitinder_test`, porta 5433) — sem mocks de banco.

```bash
cd infra && docker compose up -d        # garante o postgres_test no ar
cd ../apps/api
npm test
```

Cada teste começa com as tabelas truncadas (`tests/setup.ts`). Cobrem: cadastro/login de empresa por CNPJ (incluindo CNPJ inválido e duplicado), cadastro/login de estagiário por e-mail, e o fluxo completo de match (candidatura, bloqueio por papel, duplicidade, aceite/recusa, listagens).
