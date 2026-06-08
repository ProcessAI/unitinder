export type UsuarioRole = 'estagiario' | 'empresa'

export type MatchStatus = 'pending' | 'accepted' | 'rejected'

export interface Usuario {
  id_usuario: number
  usuario_nome: string
  usuario_email: string
  usuario_senha: string
  usuario_status: string
  usuario_created_at: Date
  usuario_update_at: Date
  id_empresa_empresa?: number
  id_estagiario_estagiario?: number
}

export interface Empresa {
  id_empresa: number
  empresa_cnpj: string
  empresa_nome: string
  empresa_setor: string
  empresa_cidade: string
  empresa_descricao?: string
  empresa_status: string
  empresa_created_at: Date
  empresa_updated_at: Date
}

export interface Estagiario {
  id_estagiario: number
  estagiario_email: string
  estagiario_senha_hash: string
  estagiario_nome_completo: string
  estagiario_cpf: string
  estagiario_data_nascimento: Date
  estagiario_telefone?: string
  estagiario_foto_perfil_url?: string
  estagiario_cidade?: string
  estagiario_estado?: string
  estagiario_disponivel_remoto?: boolean
  estagiario_instituicao?: string
  estagiario_curso?: string
  estagiario_semestre_atual?: number
  estagiario_previsao_formatura?: Date
  estagiario_turno?: string
  estagiario_area_interesse?: string
  estagiario_nivel_experiencia?: string
  estagiario_cv_url?: string
  estagiario_linkedin_url?: string
  estagiario_portfolio_url?: string
  estagiario_bio?: string
  estagiario_modalidade_preferida?: string
  estagiario_carga_horaria_preferida?: number
  estagiario_aceita_bolsa_minima?: boolean
  estagiario_ativo: boolean
  estagiario_perfil_completo: boolean
  estagiario_created_at: Date
  estagiario_update_at: Date
}

export interface Vaga {
  id_vaga: number
  vaga_titulo: string
  vaga_descricao: string
  vaga_area: string
  vaga_localidade: string
  vaga_modelo_trabalho: string
  vaga_tipo_contrato: string
  vaga_nivel: string
  vaga_qtd_vagas: number
  vaga_pcd: boolean
  vaga_salario_min?: number
  vaga_salario_max?: number
  vaga_beneficios?: string
  vaga_carga_horaria: string
  vaga_escolaridade_minima?: string
  vaga_experiencia_minima?: string
  vaga_prazo_candidatura?: Date
  vaga_status: string
  vaga_data_publicacao: Date
  vaga_created_at: Date
  vaga_updated_at: Date
  id_empresa_empresa: number
}

export interface Match {
  id_match: number
  match_created_at: Date
  match_status: MatchStatus
  id_estagiario_estagiario: number
  id_vaga_vagas: number
}

export interface Habilidade {
  id_habilidade: number
  habilidade_nome: string
  habilidade_tipo: string
  habilidade_nivel: string
  habilidade_descricao?: string
}

export interface RlVagaHabilidade {
  id_vaga_habilidade: number
  id_vaga: number
  id_habilidade: number
}

export interface RlEstagiarioHabilidade {
  id_estagiario_habilidade: number
  id_estagiario: number
  id_habilidade: number
}
