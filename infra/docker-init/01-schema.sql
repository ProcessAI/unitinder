--
-- PostgreSQL database dump
--

\restrict FK6Qdem4mi2Clyo9euDWQF7DGn735RigzMmnarYi9HQ7Yyb6Oin6adG4GZbndGg

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-05-22 20:31:25

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--



ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 17582)
-- Name: empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa (
    id_empresa integer NOT NULL,
    empresa_cnpj character(14) NOT NULL,
    empresa_nome character varying(255) NOT NULL,
    empresa_setor character varying(150),
    empresa_cidade character varying(150),
    empresa_descricao text,
    empresa_status character(1) DEFAULT 'A'::bpchar NOT NULL,
    empresa_created_at timestamp with time zone DEFAULT now() NOT NULL,
    empresa_updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.empresa OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17581)
-- Name: empresa_id_empresa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresa_id_empresa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empresa_id_empresa_seq OWNER TO postgres;

--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 221
-- Name: empresa_id_empresa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresa_id_empresa_seq OWNED BY public.empresa.id_empresa;


--
-- TOC entry 224 (class 1259 OID 17602)
-- Name: estagiario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estagiario (
    id_estagiario integer NOT NULL,
    estagiario_email character varying(255) NOT NULL,
    estagiario_senha_hash character varying(255) NOT NULL,
    estagiario_nome_completo character varying(150) NOT NULL,
    estagiario_cpf character(11) NOT NULL,
    estagiario_data_nascimento date,
    estagiario_telefone character varying(20),
    estagiario_foto_perfil_url text,
    estagiario_cidade character varying(100),
    estagiario_estado character(2),
    estagiario_disponivel_remoto boolean DEFAULT false,
    estagiario_instituicao character varying(150),
    estagiario_curso character varying(100),
    estagiario_semestre_atual smallint,
    estagiario_previsao_formatura date,
    estagiario_turno character varying(10),
    estagiario_area_interesse character varying(100),
    estagiario_nivel_experiencia character varying(20),
    estagiario_cv_url text,
    estagiario_linkedin_url text,
    estagiario_portfolio_url text,
    estagiario_bio text,
    estagiario_modalidade_preferida character varying(20),
    estagiario_carga_horaria_preferida smallint,
    estagiario_aceita_bolsa_minima boolean DEFAULT false,
    estagiario_ativo boolean DEFAULT true NOT NULL,
    estagiario_perfil_completo boolean DEFAULT false NOT NULL,
    estagiario_created_at timestamp with time zone DEFAULT now() NOT NULL,
    estagiario_updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.estagiario OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17601)
-- Name: estagiario_id_estagiario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estagiario_id_estagiario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estagiario_id_estagiario_seq OWNER TO postgres;

--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 223
-- Name: estagiario_id_estagiario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estagiario_id_estagiario_seq OWNED BY public.estagiario.id_estagiario;


--
-- TOC entry 228 (class 1259 OID 17654)
-- Name: habilidade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habilidade (
    id_habilidade integer NOT NULL,
    habilidade_nome character varying(255) NOT NULL,
    habilidade_categoria character varying(80),
    habilidade_nivel character(1),
    habilidade_descricao text
);


ALTER TABLE public.habilidade OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17653)
-- Name: habilidade_id_habilidade_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.habilidade_id_habilidade_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habilidade_id_habilidade_seq OWNER TO postgres;

--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 227
-- Name: habilidade_id_habilidade_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.habilidade_id_habilidade_seq OWNED BY public.habilidade.id_habilidade;


--
-- TOC entry 234 (class 1259 OID 17705)
-- Name: match; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match (
    id_match integer NOT NULL,
    match_data timestamp with time zone DEFAULT now() NOT NULL,
    match_status character varying(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
    id_estagiario_estagiario integer NOT NULL,
    id_vaga_vagas integer NOT NULL
);


ALTER TABLE public.match OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17704)
-- Name: match_id_match_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_id_match_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.match_id_match_seq OWNER TO postgres;

--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 233
-- Name: match_id_match_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_id_match_seq OWNED BY public.match.id_match;


--
-- TOC entry 232 (class 1259 OID 17685)
-- Name: rl_estagiario_habilidade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rl_estagiario_habilidade (
    id_estagiario_habilidade integer NOT NULL,
    id_estagiario integer NOT NULL,
    id_habilidade integer NOT NULL
);


ALTER TABLE public.rl_estagiario_habilidade OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17684)
-- Name: rl_estagiario_habilidade_id_estagiario_habilidade_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rl_estagiario_habilidade_id_estagiario_habilidade_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rl_estagiario_habilidade_id_estagiario_habilidade_seq OWNER TO postgres;

--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 231
-- Name: rl_estagiario_habilidade_id_estagiario_habilidade_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rl_estagiario_habilidade_id_estagiario_habilidade_seq OWNED BY public.rl_estagiario_habilidade.id_estagiario_habilidade;


--
-- TOC entry 230 (class 1259 OID 17665)
-- Name: rl_vaga_habilidade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rl_vaga_habilidade (
    id_vaga_habilidade integer NOT NULL,
    id_vaga integer NOT NULL,
    id_habilidade integer NOT NULL
);


ALTER TABLE public.rl_vaga_habilidade OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17664)
-- Name: rl_vaga_habilidade_id_vaga_habilidade_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rl_vaga_habilidade_id_vaga_habilidade_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rl_vaga_habilidade_id_vaga_habilidade_seq OWNER TO postgres;

--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 229
-- Name: rl_vaga_habilidade_id_vaga_habilidade_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rl_vaga_habilidade_id_vaga_habilidade_seq OWNED BY public.rl_vaga_habilidade.id_vaga_habilidade;


--
-- TOC entry 220 (class 1259 OID 17561)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    usuario_nome character varying(100) NOT NULL,
    usuario_email text NOT NULL,
    usuario_senha character varying(255) NOT NULL,
    usuario_status character(1) DEFAULT 'A'::bpchar NOT NULL,
    usuario_created_at timestamp with time zone DEFAULT now() NOT NULL,
    usuario_update_at timestamp with time zone DEFAULT now() NOT NULL,
    id_empresa_empresa integer,
    id_estagiario_estagiario integer
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17560)
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- TOC entry 226 (class 1259 OID 17630)
-- Name: vagas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vagas (
    id_vaga integer NOT NULL,
    vaga_titulo character varying(150) NOT NULL,
    vaga_descricao character varying(255),
    vaga_area character varying(80),
    vaga_localidade character varying(120),
    vaga_modelo_trabalho character varying(20),
    vaga_tipo_contrato character varying(20),
    vaga_nivel character varying(20),
    vaga_qtd_vagas integer,
    vaga_pcd boolean DEFAULT false,
    vaga_salario_min numeric(10,2),
    vaga_salario_max numeric(10,2),
    vaga_beneficios text,
    vaga_carga_horaria character varying(30),
    vaga_escolaridade_minima character varying(40),
    vaga_experiencia_minima character varying(40),
    vaga_prazo_candidatura date,
    vaga_status character(1) DEFAULT 'A'::bpchar NOT NULL,
    vaga_data_publicacao timestamp with time zone,
    vaga_created_at timestamp with time zone DEFAULT now() NOT NULL,
    vaga_updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id_empresa_empresa integer NOT NULL
);


ALTER TABLE public.vagas OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17629)
-- Name: vagas_id_vaga_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vagas_id_vaga_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vagas_id_vaga_seq OWNER TO postgres;

--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 225
-- Name: vagas_id_vaga_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vagas_id_vaga_seq OWNED BY public.vagas.id_vaga;


--
-- TOC entry 4895 (class 2604 OID 17585)
-- Name: empresa id_empresa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa ALTER COLUMN id_empresa SET DEFAULT nextval('public.empresa_id_empresa_seq'::regclass);


--
-- TOC entry 4899 (class 2604 OID 17605)
-- Name: estagiario id_estagiario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estagiario ALTER COLUMN id_estagiario SET DEFAULT nextval('public.estagiario_id_estagiario_seq'::regclass);


--
-- TOC entry 4911 (class 2604 OID 17657)
-- Name: habilidade id_habilidade; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidade ALTER COLUMN id_habilidade SET DEFAULT nextval('public.habilidade_id_habilidade_seq'::regclass);


--
-- TOC entry 4914 (class 2604 OID 17708)
-- Name: match id_match; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match ALTER COLUMN id_match SET DEFAULT nextval('public.match_id_match_seq'::regclass);


--
-- TOC entry 4913 (class 2604 OID 17688)
-- Name: rl_estagiario_habilidade id_estagiario_habilidade; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rl_estagiario_habilidade ALTER COLUMN id_estagiario_habilidade SET DEFAULT nextval('public.rl_estagiario_habilidade_id_estagiario_habilidade_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 17668)
-- Name: rl_vaga_habilidade id_vaga_habilidade; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rl_vaga_habilidade ALTER COLUMN id_vaga_habilidade SET DEFAULT nextval('public.rl_vaga_habilidade_id_vaga_habilidade_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 17564)
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- TOC entry 4906 (class 2604 OID 17633)
-- Name: vagas id_vaga; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vagas ALTER COLUMN id_vaga SET DEFAULT nextval('public.vagas_id_vaga_seq'::regclass);


--
-- TOC entry 5100 (class 0 OID 17582)
-- Dependencies: 222
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresa (id_empresa, empresa_cnpj, empresa_nome, empresa_setor, empresa_cidade, empresa_descricao, empresa_status, empresa_created_at, empresa_updated_at) FROM stdin;
\.


--
-- TOC entry 5102 (class 0 OID 17602)
-- Dependencies: 224
-- Data for Name: estagiario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estagiario (id_estagiario, estagiario_email, estagiario_senha_hash, estagiario_nome_completo, estagiario_cpf, estagiario_data_nascimento, estagiario_telefone, estagiario_foto_perfil_url, estagiario_cidade, estagiario_estado, estagiario_disponivel_remoto, estagiario_instituicao, estagiario_curso, estagiario_semestre_atual, estagiario_previsao_formatura, estagiario_turno, estagiario_area_interesse, estagiario_nivel_experiencia, estagiario_cv_url, estagiario_linkedin_url, estagiario_portfolio_url, estagiario_bio, estagiario_modalidade_preferida, estagiario_carga_horaria_preferida, estagiario_aceita_bolsa_minima, estagiario_ativo, estagiario_perfil_completo, estagiario_created_at, estagiario_updated_at) FROM stdin;
\.


--
-- TOC entry 5106 (class 0 OID 17654)
-- Dependencies: 228
-- Data for Name: habilidade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.habilidade (id_habilidade, habilidade_nome, habilidade_categoria, habilidade_nivel, habilidade_descricao) FROM stdin;
\.


--
-- TOC entry 5112 (class 0 OID 17705)
-- Dependencies: 234
-- Data for Name: match; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.match (id_match, match_data, match_status, id_estagiario_estagiario, id_vaga_vagas) FROM stdin;
\.


--
-- TOC entry 5110 (class 0 OID 17685)
-- Dependencies: 232
-- Data for Name: rl_estagiario_habilidade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rl_estagiario_habilidade (id_estagiario_habilidade, id_estagiario, id_habilidade) FROM stdin;
\.


--
-- TOC entry 5108 (class 0 OID 17665)
-- Dependencies: 230
-- Data for Name: rl_vaga_habilidade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rl_vaga_habilidade (id_vaga_habilidade, id_vaga, id_habilidade) FROM stdin;
\.


--
-- TOC entry 5098 (class 0 OID 17561)
-- Dependencies: 220
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_usuario, usuario_nome, usuario_email, usuario_senha, usuario_status, usuario_created_at, usuario_update_at, id_empresa_empresa, id_estagiario_estagiario) FROM stdin;
\.


--
-- TOC entry 5104 (class 0 OID 17630)
-- Dependencies: 226
-- Data for Name: vagas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vagas (id_vaga, vaga_titulo, vaga_descricao, vaga_area, vaga_localidade, vaga_modelo_trabalho, vaga_tipo_contrato, vaga_nivel, vaga_qtd_vagas, vaga_pcd, vaga_salario_min, vaga_salario_max, vaga_beneficios, vaga_carga_horaria, vaga_escolaridade_minima, vaga_experiencia_minima, vaga_prazo_candidatura, vaga_status, vaga_data_publicacao, vaga_created_at, vaga_updated_at, id_empresa_empresa) FROM stdin;
\.


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 221
-- Name: empresa_id_empresa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empresa_id_empresa_seq', 1, false);


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 223
-- Name: estagiario_id_estagiario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estagiario_id_estagiario_seq', 1, false);


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 227
-- Name: habilidade_id_habilidade_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.habilidade_id_habilidade_seq', 1, false);


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 233
-- Name: match_id_match_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.match_id_match_seq', 1, false);


--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 231
-- Name: rl_estagiario_habilidade_id_estagiario_habilidade_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rl_estagiario_habilidade_id_estagiario_habilidade_seq', 1, false);


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 229
-- Name: rl_vaga_habilidade_id_vaga_habilidade_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rl_vaga_habilidade_id_vaga_habilidade_seq', 1, false);


--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 1, false);


--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 225
-- Name: vagas_id_vaga_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vagas_id_vaga_seq', 1, false);


--
-- TOC entry 4922 (class 2606 OID 17600)
-- Name: empresa empresa_empresa_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_empresa_cnpj_key UNIQUE (empresa_cnpj);


--
-- TOC entry 4924 (class 2606 OID 17598)
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id_empresa);


--
-- TOC entry 4926 (class 2606 OID 17628)
-- Name: estagiario estagiario_estagiario_cpf_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estagiario
    ADD CONSTRAINT estagiario_estagiario_cpf_key UNIQUE (estagiario_cpf);


--
-- TOC entry 4928 (class 2606 OID 17626)
-- Name: estagiario estagiario_estagiario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estagiario
    ADD CONSTRAINT estagiario_estagiario_email_key UNIQUE (estagiario_email);


--
-- TOC entry 4930 (class 2606 OID 17624)
-- Name: estagiario estagiario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estagiario
    ADD CONSTRAINT estagiario_pkey PRIMARY KEY (id_estagiario);


--
-- TOC entry 4934 (class 2606 OID 17663)
-- Name: habilidade habilidade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidade
    ADD CONSTRAINT habilidade_pkey PRIMARY KEY (id_habilidade);


--
-- TOC entry 4940 (class 2606 OID 17717)
-- Name: match match_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_pkey PRIMARY KEY (id_match);


--
-- TOC entry 4938 (class 2606 OID 17693)
-- Name: rl_estagiario_habilidade rl_estagiario_habilidade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rl_estagiario_habilidade
    ADD CONSTRAINT rl_estagiario_habilidade_pkey PRIMARY KEY (id_estagiario_habilidade);


--
-- TOC entry 4936 (class 2606 OID 17673)
-- Name: rl_vaga_habilidade rl_vaga_habilidade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rl_vaga_habilidade
    ADD CONSTRAINT rl_vaga_habilidade_pkey PRIMARY KEY (id_vaga_habilidade);


--
-- TOC entry 4918 (class 2606 OID 17578)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4920 (class 2606 OID 17580)
-- Name: usuario usuario_usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_usuario_email_key UNIQUE (usuario_email);


--
-- TOC entry 4932 (class 2606 OID 17647)
-- Name: vagas vagas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vagas
    ADD CONSTRAINT vagas_pkey PRIMARY KEY (id_vaga);


--
-- TOC entry 4948 (class 2606 OID 17718)
-- Name: match match_estagiario_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_estagiario_fk FOREIGN KEY (id_estagiario_estagiario) REFERENCES public.estagiario(id_estagiario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4949 (class 2606 OID 17723)
-- Name: match match_vaga_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_vaga_fk FOREIGN KEY (id_vaga_vagas) REFERENCES public.vagas(id_vaga) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4946 (class 2606 OID 17694)
-- Name: rl_estagiario_habilidade rl_est_hab_estagiario_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rl_estagiario_habilidade
    ADD CONSTRAINT rl_est_hab_estagiario_fk FOREIGN KEY (id_estagiario) REFERENCES public.estagiario(id_estagiario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4947 (class 2606 OID 17699)
-- Name: rl_estagiario_habilidade rl_est_hab_habilidade_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rl_estagiario_habilidade
    ADD CONSTRAINT rl_est_hab_habilidade_fk FOREIGN KEY (id_habilidade) REFERENCES public.habilidade(id_habilidade) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4944 (class 2606 OID 17679)
-- Name: rl_vaga_habilidade rl_vaga_habilidade_habilidade_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rl_vaga_habilidade
    ADD CONSTRAINT rl_vaga_habilidade_habilidade_fk FOREIGN KEY (id_habilidade) REFERENCES public.habilidade(id_habilidade) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4945 (class 2606 OID 17674)
-- Name: rl_vaga_habilidade rl_vaga_habilidade_vaga_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rl_vaga_habilidade
    ADD CONSTRAINT rl_vaga_habilidade_vaga_fk FOREIGN KEY (id_vaga) REFERENCES public.vagas(id_vaga) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4941 (class 2606 OID 17728)
-- Name: usuario usuario_empresa_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_empresa_fk FOREIGN KEY (id_empresa_empresa) REFERENCES public.empresa(id_empresa) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4942 (class 2606 OID 17733)
-- Name: usuario usuario_estagiario_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_estagiario_fk FOREIGN KEY (id_estagiario_estagiario) REFERENCES public.estagiario(id_estagiario) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4943 (class 2606 OID 17648)
-- Name: vagas vagas_empresa_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vagas
    ADD CONSTRAINT vagas_empresa_fk FOREIGN KEY (id_empresa_empresa) REFERENCES public.empresa(id_empresa) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-05-22 20:31:26

--
-- PostgreSQL database dump complete
--

\unrestrict FK6Qdem4mi2Clyo9euDWQF7DGn735RigzMmnarYi9HQ7Yyb6Oin6adG4GZbndGg

