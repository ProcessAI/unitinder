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
│       └── src/
├── shared/
├── docs/
└── infra/
```

## Para que serve cada pasta

- `apps/web`: aplicação frontend em React, responsável pela interface do usuário, telas, componentes e experiência visual.
- `apps/web/src`: código-fonte principal do frontend.
- `apps/api`: backend em Node.js, responsável por regras de negócio, autenticação, integrações e API.
- `apps/api/src`: código-fonte principal do backend.
- `shared`: recursos compartilhados entre frontend e backend, como tipos, contratos e utilitários comuns.
- `docs`: documentação do projeto, decisões técnicas e materiais de apoio.
- `infra`: arquivos de infraestrutura, automação e configurações de ambiente.

## Observação

A estrutura foi criada apenas para organizar o projeto. Nenhuma funcionalidade foi implementada ainda.
