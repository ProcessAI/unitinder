-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "usuario_nome" VARCHAR(100) NOT NULL,
    "usuario_email" TEXT NOT NULL,
    "usuario_senha" VARCHAR(255) NOT NULL,
    "usuario_status" CHAR(1) NOT NULL DEFAULT 'A',
    "usuario_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_update_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_empresa_empresa" INTEGER,
    "id_estagiario_estagiario" INTEGER,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "empresa" (
    "id_empresa" SERIAL NOT NULL,
    "empresa_cnpj" CHAR(14) NOT NULL,
    "empresa_nome" VARCHAR(255) NOT NULL,
    "empresa_setor" VARCHAR(150),
    "empresa_cidade" VARCHAR(150),
    "empresa_descricao" TEXT,
    "empresa_status" CHAR(1) NOT NULL DEFAULT 'A',
    "empresa_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empresa_updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id_empresa")
);

-- CreateTable
CREATE TABLE "estagiario" (
    "id_estagiario" SERIAL NOT NULL,
    "estagiario_email" VARCHAR(255) NOT NULL,
    "estagiario_senha_hash" VARCHAR(255) NOT NULL,
    "estagiario_nome_completo" VARCHAR(150) NOT NULL,
    "estagiario_cpf" CHAR(11) NOT NULL,
    "estagiario_data_nascimento" DATE,
    "estagiario_telefone" VARCHAR(20),
    "estagiario_foto_perfil_url" TEXT,
    "estagiario_cidade" VARCHAR(100),
    "estagiario_estado" CHAR(2),
    "estagiario_disponivel_remoto" BOOLEAN DEFAULT false,
    "estagiario_instituicao" VARCHAR(150),
    "estagiario_curso" VARCHAR(100),
    "estagiario_semestre_atual" SMALLINT,
    "estagiario_previsao_formatura" DATE,
    "estagiario_turno" VARCHAR(10),
    "estagiario_area_interesse" VARCHAR(100),
    "estagiario_nivel_experiencia" VARCHAR(20),
    "estagiario_cv_url" TEXT,
    "estagiario_linkedin_url" TEXT,
    "estagiario_portfolio_url" TEXT,
    "estagiario_bio" TEXT,
    "estagiario_modalidade_preferida" VARCHAR(20),
    "estagiario_carga_horaria_preferida" SMALLINT,
    "estagiario_aceita_bolsa_minima" BOOLEAN DEFAULT false,
    "estagiario_ativo" BOOLEAN NOT NULL DEFAULT true,
    "estagiario_perfil_completo" BOOLEAN NOT NULL DEFAULT false,
    "estagiario_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estagiario_updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estagiario_pkey" PRIMARY KEY ("id_estagiario")
);

-- CreateTable
CREATE TABLE "vagas" (
    "id_vaga" SERIAL NOT NULL,
    "vaga_titulo" VARCHAR(150) NOT NULL,
    "vaga_descricao" TEXT,
    "vaga_area" VARCHAR(80),
    "vaga_localidade" VARCHAR(120),
    "vaga_modelo_trabalho" VARCHAR(20),
    "vaga_tipo_contrato" VARCHAR(20),
    "vaga_nivel" VARCHAR(20),
    "vaga_qtd_vagas" INTEGER,
    "vaga_pcd" BOOLEAN DEFAULT false,
    "vaga_salario_min" DECIMAL(10,2),
    "vaga_salario_max" DECIMAL(10,2),
    "vaga_beneficios" TEXT,
    "vaga_carga_horaria" VARCHAR(30),
    "vaga_escolaridade_minima" VARCHAR(40),
    "vaga_experiencia_minima" VARCHAR(40),
    "vaga_prazo_candidatura" DATE,
    "vaga_status" CHAR(1) NOT NULL DEFAULT 'A',
    "vaga_data_publicacao" TIMESTAMPTZ,
    "vaga_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vaga_updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_empresa_empresa" INTEGER NOT NULL,

    CONSTRAINT "vagas_pkey" PRIMARY KEY ("id_vaga")
);

-- CreateTable
CREATE TABLE "match" (
    "id_match" SERIAL NOT NULL,
    "match_data" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "match_status" VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    "id_estagiario_estagiario" INTEGER NOT NULL,
    "id_vaga_vagas" INTEGER NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id_match")
);

-- CreateTable
CREATE TABLE "habilidade" (
    "id_habilidade" SERIAL NOT NULL,
    "habilidade_nome" VARCHAR(255) NOT NULL,
    "habilidade_categoria" VARCHAR(80),
    "habilidade_nivel" CHAR(1),
    "habilidade_descricao" TEXT,

    CONSTRAINT "habilidade_pkey" PRIMARY KEY ("id_habilidade")
);

-- CreateTable
CREATE TABLE "rl_estagiario_habilidade" (
    "id_estagiario_habilidade" SERIAL NOT NULL,
    "id_estagiario" INTEGER NOT NULL,
    "id_habilidade" INTEGER NOT NULL,

    CONSTRAINT "rl_estagiario_habilidade_pkey" PRIMARY KEY ("id_estagiario_habilidade")
);

-- CreateTable
CREATE TABLE "rl_vaga_habilidade" (
    "id_vaga_habilidade" SERIAL NOT NULL,
    "id_vaga" INTEGER NOT NULL,
    "id_habilidade" INTEGER NOT NULL,

    CONSTRAINT "rl_vaga_habilidade_pkey" PRIMARY KEY ("id_vaga_habilidade")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_usuario_email_key" ON "usuario"("usuario_email");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_empresa_cnpj_key" ON "empresa"("empresa_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "estagiario_estagiario_email_key" ON "estagiario"("estagiario_email");

-- CreateIndex
CREATE UNIQUE INDEX "estagiario_estagiario_cpf_key" ON "estagiario"("estagiario_cpf");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_empresa_empresa_fkey" FOREIGN KEY ("id_empresa_empresa") REFERENCES "empresa"("id_empresa") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_estagiario_estagiario_fkey" FOREIGN KEY ("id_estagiario_estagiario") REFERENCES "estagiario"("id_estagiario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_id_empresa_empresa_fkey" FOREIGN KEY ("id_empresa_empresa") REFERENCES "empresa"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_id_estagiario_estagiario_fkey" FOREIGN KEY ("id_estagiario_estagiario") REFERENCES "estagiario"("id_estagiario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_id_vaga_vagas_fkey" FOREIGN KEY ("id_vaga_vagas") REFERENCES "vagas"("id_vaga") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rl_estagiario_habilidade" ADD CONSTRAINT "rl_estagiario_habilidade_id_estagiario_fkey" FOREIGN KEY ("id_estagiario") REFERENCES "estagiario"("id_estagiario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rl_estagiario_habilidade" ADD CONSTRAINT "rl_estagiario_habilidade_id_habilidade_fkey" FOREIGN KEY ("id_habilidade") REFERENCES "habilidade"("id_habilidade") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rl_vaga_habilidade" ADD CONSTRAINT "rl_vaga_habilidade_id_vaga_fkey" FOREIGN KEY ("id_vaga") REFERENCES "vagas"("id_vaga") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rl_vaga_habilidade" ADD CONSTRAINT "rl_vaga_habilidade_id_habilidade_fkey" FOREIGN KEY ("id_habilidade") REFERENCES "habilidade"("id_habilidade") ON DELETE CASCADE ON UPDATE CASCADE;
