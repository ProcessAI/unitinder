# unitinder
A plataforma que te conecta com sua primeira vaga de trabalho.

## Estrutura do projeto

O repositório foi organizado como um monorepo, mantendo frontend e backend no mesmo lugar para facilitar o desenvolvimento e a evolução do app.

```text
unitinder/
├── apps/
│   ├── web/
│   │   └── src/
│   └── api/
│       ├── prisma/
│       ├── tests/
│       └── src/
├── shared/
├── docs/
└── infra/
    ├── Unitinder.sql
    ├── docker-compose.yml
    └── docker-init/
```

## Para que serve cada pasta

- `apps/web`: aplicação frontend em React, responsável pela interface do usuário, telas, componentes e experiência visual. Guia completo em [`apps/web/README.md`](apps/web/README.md).
- `apps/api`: backend em Node.js/Express + Prisma, responsável por autenticação, regras de negócio e persistência. Guia completo em [`apps/api/README.md`](apps/api/README.md).
- `shared`: recursos compartilhados entre frontend e backend, como tipos, contratos e utilitários comuns.
- `docs`: documentação do projeto, decisões técnicas e materiais de apoio.
- `infra`: schema do banco (`Unitinder.sql`) e o `docker-compose.yml` que sobe o Postgres de desenvolvimento e de testes.

## O que já está implementado

- **Login** unificado: estagiário entra com e-mail, empresa entra com CNPJ (14 dígitos, com validação de dígito verificador).
- **Cadastro de empresa** com CNPJ validado e cadastro de estagiário, ambos gerando token JWT.
- **Match**: candidatura do estagiário a uma vaga, listagem por estagiário/por vaga, aceite ou recusa pela empresa.
- **Vagas**: criação (empresa) e listagem (feed do estagiário).
- Banco real via **Prisma**, com schema espelhando `infra/Unitinder.sql`.
- Testes automatizados (Vitest + Supertest) rodando contra Postgres real, sem mocks.
- Frontend (Login, Cadastro de empresa, Minhas vagas, Feed, Matches, Candidatos) já consumindo a API de verdade através de `apps/web/src/lib/api.ts`.

## Como rodar o projeto localmente

Você precisa de 3 coisas rodando ao mesmo tempo: **banco de dados** (Docker), **backend** e **frontend**.

### 1. Banco de dados (Docker)

```bash
cd infra
docker compose up -d
```

Isso sobe dois containers Postgres, já inicializados com o schema de `Unitinder.sql`:

| Container | Porta | Banco | Uso |
|---|---|---|---|
| `unitinder-postgres` | `5432` | `unitinder` | desenvolvimento |
| `unitinder-postgres-test` | `5433` | `unitinder_test` | testes automatizados |

Para parar: `docker compose down` (ou `docker compose down -v` para apagar os dados também).

### 2. Backend (`apps/api`)

```bash
cd apps/api
npm install
cp .env.example .env        # ajuste se necessário — já vem configurado para o Docker acima
npx prisma generate
npm run dev
```

API disponível em `http://localhost:3333`.

Outros comandos úteis:

```bash
npm test               # roda os testes contra o Postgres de teste (porta 5433)
npm run build && npm start   # build de produção
```

### 3. Frontend (`apps/web`)

```bash
cd apps/web
npm install
npm run dev
```

App disponível em `http://localhost:5173`. Por padrão ele já aponta para `http://localhost:3333` (pode ser sobrescrito com `VITE_API_URL` num `.env`, veja `apps/web/.env.example`).

### 4. Testando o fluxo

1. Acesse `http://localhost:5173`, escolha **Empresa** ou **Estagiário**.
2. Para testar como empresa: vá em `/empresa/cadastro`, cadastre com um CNPJ válido (ex.: `11.222.333/0001-81`) e depois faça login em `/login` usando esse mesmo CNPJ.
3. Publique uma vaga em "Minhas vagas".
4. Para testar como estagiário, é necessário cadastrar via API (`POST /auth/registro/usuario`) — a tela de cadastro de estagiário no frontend ainda está em desenvolvimento por outro integrante do time.

Mais detalhes técnicos (rotas, autenticação, schema do banco, convenções) estão nos READMEs de cada app: [`apps/api/README.md`](apps/api/README.md) e [`apps/web/README.md`](apps/web/README.md).
