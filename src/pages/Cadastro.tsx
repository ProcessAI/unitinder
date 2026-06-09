import React, { useState, ChangeEvent } from 'react'

// ── Tipos ─────────────────────────────────────────────────────────────────
type Turno = 'manha' | 'tarde' | 'noite' | 'integral'
type NivelExperiencia = 'nenhuma' | 'baixa' | 'media' | 'alta'
type ModalidadePreferida = 'presencial' | 'remoto' | 'hibrido'

interface FormData {
  email: string
  senha: string
  confirmar_senha: string
  cpf: string
  nome_completo: string
  foto_perfil_url: string
  data_nascimento: string
  telefone: string
  cidade: string
  estado: string
  disponivel_remoto: boolean
  instituicao: string
  curso: string
  semestre_atual: string
  previsao_formatura: string
  turno: Turno | ''
  area_interesse: string
  nivel_experiencia: NivelExperiencia | ''
  modalidade_preferida: ModalidadePreferida | ''
  carga_horaria_preferida: string
  aceita_bolsa_minima: boolean
  cv_url: string
  linkedin_url: string
  portfolio_url: string
  bio: string
  habilidades: string[]
}

type FormErrors = Partial<Record<keyof FormData, string>>

// ── Constantes ────────────────────────────────────────────────────────────
const ESTADOS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS',
  'MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

const INICIAL: FormData = {
  email: '', senha: '', confirmar_senha: '', cpf: '', nome_completo: '',
  foto_perfil_url: '', data_nascimento: '', telefone: '', cidade: '',
  estado: '', disponivel_remoto: false, instituicao: '', curso: '',
  semestre_atual: '', previsao_formatura: '', turno: '',
  area_interesse: '', nivel_experiencia: '', modalidade_preferida: '',
  carga_horaria_preferida: '', aceita_bolsa_minima: false,
  cv_url: '', linkedin_url: '', portfolio_url: '', bio: '',
  habilidades: [''],
}

// ── Máscaras ──────────────────────────────────────────────────────────────
function mascaraCPF(v: string) {
  return v.replace(/\D/g,'').slice(0,11)
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1,2})$/,'$1-$2')
}
function mascaraTel(v: string) {
  return v.replace(/\D/g,'').slice(0,11)
    .replace(/^(\d{2})(\d)/,'($1) $2')
    .replace(/(\d{5})(\d{1,4})$/,'$1-$2')
}

// ── Validação ─────────────────────────────────────────────────────────────
function validar(f: FormData): FormErrors {
  const e: FormErrors = {}
  if (!f.nome_completo.trim()) e.nome_completo = 'Nome obrigatório.'
  if (!f.email.trim()) e.email = 'E-mail obrigatório.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'E-mail inválido.'
  if (!f.cpf.trim()) e.cpf = 'CPF obrigatório.'
  else if (f.cpf.replace(/\D/g,'').length !== 11) e.cpf = 'CPF deve ter 11 dígitos.'
  if (!f.senha) e.senha = 'Senha obrigatória.'
  else if (f.senha.length < 8) e.senha = 'Mínimo 8 caracteres.'
  if (f.senha !== f.confirmar_senha) e.confirmar_senha = 'Senhas não coincidem.'
  if (!f.data_nascimento) e.data_nascimento = 'Data de nascimento obrigatória.'
  return e
}

// ── Estilos inline ────────────────────────────────────────────────────────
const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #eef4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.wrap { background: #eef4f8; min-height: 100vh; }
.topbar { background: #fff; border-bottom: 0.5px solid #d6e4ef; padding: 0 1.5rem; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
.logo-img { height: 40px; width: auto; object-fit: contain; background: #fff; border-radius: 6px; padding: 2px; }
.btn-sair { font-size: 13px; padding: 5px 16px; border: 1px solid #2a9d8f; border-radius: 6px; background: #fff; color: #2a9d8f; cursor: pointer; }
.btn-sair:hover { background: #e8f8f5; }
.outer { display: flex; justify-content: center; padding: 2.5rem 1rem 3rem; }
.inner { width: 100%; max-width: 560px; }
h1 { font-size: 22px; font-weight: 500; color: #1b3a52; margin-bottom: 1.5rem; text-align: center; }
.card { background: #fff; border: 0.5px solid #cddce8; border-radius: 12px; padding: 1.5rem; margin-bottom: 14px; }
.sec { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .07em; color: #5f8aa0; margin-bottom: 1rem; padding-bottom: 8px; border-bottom: 0.5px solid #e0eaf2; }
.row { display: grid; gap: 10px; margin-bottom: 10px; }
.r1 { grid-template-columns: 1fr; }
.r2 { grid-template-columns: 1fr 1fr; }
.r3 { grid-template-columns: 2fr 1fr; }
.campo { display: flex; flex-direction: column; gap: 4px; }
.campo label { font-size: 12px; color: #5f8aa0; }
.req { color: #e05050; }
.erro-msg { font-size: 11px; color: #e05050; margin-top: 2px; }
input, select, textarea { font-family: inherit; font-size: 13px; color: #1b3a52; background: #eef4f8; border: 1px solid #cddce8; border-radius: 7px; padding: 8px 10px; width: 100%; outline: none; transition: border-color .15s, box-shadow .15s; }
input:focus, select:focus, textarea:focus { border-color: #2a9d8f; box-shadow: 0 0 0 3px rgba(42,157,143,.1); }
textarea { resize: vertical; min-height: 88px; }
input[type=checkbox] { width: 15px; height: 15px; accent-color: #2a9d8f; cursor: pointer; }
.cbrow { display: flex; align-items: center; gap: 9px; padding: 6px 0; }
.cbrow label { font-size: 13px; color: #1b3a52; cursor: pointer; }
.avatar-wrap { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.avatar-circle { width: 52px; height: 52px; border-radius: 50%; border: 1px solid #cddce8; background: #eef4f8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-label { font-size: 13px; color: #1b3a52; font-weight: 500; margin-bottom: 6px; }
.btn-foto { font-size: 12px; padding: 5px 12px; border: 1px solid #cddce8; border-radius: 6px; background: #eef4f8; color: #5f8aa0; cursor: pointer; }
.hint { font-size: 11px; color: #8aabb8; margin-top: 2px; }
.skills-list { display: flex; flex-direction: column; gap: 8px; }
.srow { display: flex; gap: 8px; align-items: center; }
.srow input { flex: 1; width: auto; }
.btn-rm { width: 30px; height: 30px; border: 1px solid #cddce8; border-radius: 7px; background: #eef4f8; color: #5f8aa0; cursor: pointer; flex-shrink: 0; font-size: 14px; }
.btn-rm:hover { border-color: #e05050; color: #e05050; background: #fff5f5; }
.btn-add { display: flex; align-items: center; gap: 6px; font-size: 13px; padding: 8px 12px; border: 1px dashed #9ec4d4; border-radius: 7px; background: transparent; color: #5f8aa0; cursor: pointer; width: 100%; justify-content: center; margin-top: 6px; }
.btn-add:hover { background: #eef4f8; color: #1b3a52; }
.foot { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }
.btn-back { font-size: 14px; color: #5f8aa0; background: none; border: none; cursor: pointer; }
.btn-back:hover { color: #1b3a52; }
.btn-criar { font-size: 14px; font-weight: 500; padding: 10px 28px; background: #1b3a52; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.btn-criar:hover:not(:disabled) { background: #142e42; }
.btn-criar:disabled { opacity: .6; cursor: not-allowed; }
.sucesso { text-align: center; padding-top: 4rem; }
.sucesso-emoji { font-size: 48px; margin-bottom: 1rem; }
@media (max-width: 480px) { .r2, .r3 { grid-template-columns: 1fr; } .card { padding: 1rem; } }
`

// ── Componentes auxiliares ────────────────────────────────────────────────
function Campo({ id, label, obrigatorio, erro, children }: {
  id: string; label: string; obrigatorio?: boolean; erro?: string; children: React.ReactNode
}) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}{obrigatorio && <span className="req"> *</span>}</label>
      {children}
      {erro && <span className="erro-msg">{erro}</span>}
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="sec">{titulo}</div>
      {children}
    </section>
  )
}

// ── Página principal ──────────────────────────────────────────────────────
export default function Cadastro() {
  const [form, setForm] = useState<FormData>(INICIAL)
  const [erros, setErros] = useState<FormErrors>({})
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function set(name: keyof FormData, value: string | boolean) {
    setForm(p => ({ ...p, [name]: value }))
    setErros(p => ({ ...p, [name]: undefined }))
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    set(name as keyof FormData, type === 'checkbox' ? checked : value)
  }

  function addHab() { setForm(p => ({ ...p, habilidades: [...p.habilidades, ''] })) }
  function rmHab(i: number) {
    if (form.habilidades.length <= 1) return
    setForm(p => ({ ...p, habilidades: p.habilidades.filter((_, idx) => idx !== i) }))
  }
  function setHab(i: number, v: string) {
    setForm(p => { const h = [...p.habilidades]; h[i] = v; return { ...p, habilidades: h } })
  }

  async function handleSubmit() {
    const e = validar(form)
    if (Object.keys(e).length > 0) {
      setErros(e)
      document.querySelector('.erro-msg')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setEnviando(true)
    try {
      // TODO: trocar pela URL da sua API
      // await fetch('/api/candidatos', { method: 'POST', body: JSON.stringify(form) })
      await new Promise(r => setTimeout(r, 800)) // simulação
      setSucesso(true)
    } catch {
      alert('Erro ao criar perfil. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <header className="topbar">
          <img className="logo-img" src="/logo.png" alt="UniTinder" />
          <button className="btn-sair">Sair</button>
        </header>

        {sucesso ? (
          <div className="outer">
            <div className="inner sucesso">
              <div className="sucesso-emoji">🎉</div>
              <h1>Perfil criado com sucesso!</h1>
              <p style={{ color: '#5f8aa0', marginTop: 8 }}>Bem-vindo ao UniTinder.</p>
            </div>
          </div>
        ) : (
          <main className="outer">
            <div className="inner">
              <h1>Cadastro de estagiário</h1>

              {/* CONTA */}
              <Secao titulo="Conta">
                <div className="avatar-wrap">
                  <div className="avatar-circle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5f8aa0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                  <div>
                    <div className="avatar-label">Foto de perfil</div>
                    <button className="btn-foto" type="button">Enviar foto</button>
                    <div className="hint">ou insira a URL abaixo</div>
                  </div>
                </div>
                <div className="row r1">
                  <Campo id="foto_perfil_url" label="URL da foto de perfil">
                    <input id="foto_perfil_url" name="foto_perfil_url" type="url" placeholder="https://..." value={form.foto_perfil_url} onChange={handleChange}/>
                  </Campo>
                </div>
                <div className="row r2">
                  <Campo id="email" label="E-mail" obrigatorio erro={erros.email}>
                    <input id="email" name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange}/>
                  </Campo>
                  <Campo id="cpf" label="CPF" obrigatorio erro={erros.cpf}>
                    <input id="cpf" name="cpf" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={e => set('cpf', mascaraCPF(e.target.value))}/>
                  </Campo>
                </div>
                <div className="row r2">
                  <Campo id="senha" label="Senha" obrigatorio erro={erros.senha}>
                    <input id="senha" name="senha" type="password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={handleChange}/>
                  </Campo>
                  <Campo id="confirmar_senha" label="Confirmar senha" obrigatorio erro={erros.confirmar_senha}>
                    <input id="confirmar_senha" name="confirmar_senha" type="password" placeholder="Repita a senha" value={form.confirmar_senha} onChange={handleChange}/>
                  </Campo>
                </div>
              </Secao>

              {/* DADOS PESSOAIS */}
              <Secao titulo="Dados pessoais">
                <div className="row r1">
                  <Campo id="nome_completo" label="Nome completo" obrigatorio erro={erros.nome_completo}>
                    <input id="nome_completo" name="nome_completo" type="text" placeholder="Seu nome completo" value={form.nome_completo} onChange={handleChange}/>
                  </Campo>
                </div>
                <div className="row r2">
                  <Campo id="data_nascimento" label="Data de nascimento" obrigatorio erro={erros.data_nascimento}>
                    <input id="data_nascimento" name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange}/>
                  </Campo>
                  <Campo id="telefone" label="Telefone">
                    <input id="telefone" name="telefone" type="tel" placeholder="(00) 90000-0000" value={form.telefone} onChange={e => set('telefone', mascaraTel(e.target.value))}/>
                  </Campo>
                </div>
                <div className="row r3">
                  <Campo id="cidade" label="Cidade">
                    <input id="cidade" name="cidade" type="text" placeholder="Sua cidade" value={form.cidade} onChange={handleChange}/>
                  </Campo>
                  <Campo id="estado" label="UF">
                    <select id="estado" name="estado" value={form.estado} onChange={handleChange}>
                      <option value="">UF</option>
                      {ESTADOS.map(uf => <option key={uf}>{uf}</option>)}
                    </select>
                  </Campo>
                </div>
                <div className="cbrow">
                  <input id="disponivel_remoto" name="disponivel_remoto" type="checkbox" checked={form.disponivel_remoto} onChange={handleChange}/>
                  <label htmlFor="disponivel_remoto">Disponível para trabalho remoto</label>
                </div>
              </Secao>

              {/* FORMAÇÃO */}
              <Secao titulo="Formação acadêmica">
                <div className="row r1">
                  <Campo id="instituicao" label="Instituição">
                    <input id="instituicao" name="instituicao" type="text" placeholder="Nome da universidade / faculdade" value={form.instituicao} onChange={handleChange}/>
                  </Campo>
                </div>
                <div className="row r2">
                  <Campo id="curso" label="Curso">
                    <input id="curso" name="curso" type="text" placeholder="Ex: Ciência da Computação" value={form.curso} onChange={handleChange}/>
                  </Campo>
                  <Campo id="semestre_atual" label="Semestre atual">
                    <input id="semestre_atual" name="semestre_atual" type="number" min={1} max={14} placeholder="Ex: 5" value={form.semestre_atual} onChange={handleChange}/>
                  </Campo>
                </div>
                <div className="row r2">
                  <Campo id="previsao_formatura" label="Previsão de formatura">
                    <input id="previsao_formatura" name="previsao_formatura" type="date" value={form.previsao_formatura} onChange={handleChange}/>
                  </Campo>
                  <Campo id="turno" label="Turno">
                    <select id="turno" name="turno" value={form.turno} onChange={handleChange}>
                      <option value="">Selecione</option>
                      <option value="manha">Manhã</option>
                      <option value="tarde">Tarde</option>
                      <option value="noite">Noite</option>
                      <option value="integral">Integral</option>
                    </select>
                  </Campo>
                </div>
              </Secao>

              {/* HABILIDADES */}
              <Secao titulo="Habilidades">
                <div className="skills-list">
                  {form.habilidades.map((h, i) => (
                    <div className="srow" key={i}>
                      <input type="text" placeholder="Ex: React, Python, Figma..." value={h} onChange={e => setHab(i, e.target.value)}/>
                      <button type="button" className="btn-rm" onClick={() => rmHab(i)} aria-label="Remover">✕</button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-add" onClick={addHab}>+ Adicionar habilidade</button>
              </Secao>

              {/* PREFERÊNCIAS */}
              <Secao titulo="Preferências profissionais">
                <div className="row r2">
                  <Campo id="area_interesse" label="Área de interesse">
                    <input id="area_interesse" name="area_interesse" type="text" placeholder="Ex: Desenvolvimento web" value={form.area_interesse} onChange={handleChange}/>
                  </Campo>
                  <Campo id="nivel_experiencia" label="Nível de experiência">
                    <select id="nivel_experiencia" name="nivel_experiencia" value={form.nivel_experiencia} onChange={handleChange}>
                      <option value="">Selecione</option>
                      <option value="nenhuma">Nenhuma</option>
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </Campo>
                </div>
                <div className="row r2">
                  <Campo id="modalidade_preferida" label="Modalidade preferida">
                    <select id="modalidade_preferida" name="modalidade_preferida" value={form.modalidade_preferida} onChange={handleChange}>
                      <option value="">Selecione</option>
                      <option value="presencial">Presencial</option>
                      <option value="remoto">Remoto</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                  </Campo>
                  <Campo id="carga_horaria_preferida" label="Carga horária (h/semana)">
                    <input id="carga_horaria_preferida" name="carga_horaria_preferida" type="number" min={1} max={44} placeholder="Ex: 20" value={form.carga_horaria_preferida} onChange={handleChange}/>
                  </Campo>
                </div>
                <div className="cbrow">
                  <input id="aceita_bolsa_minima" name="aceita_bolsa_minima" type="checkbox" checked={form.aceita_bolsa_minima} onChange={handleChange}/>
                  <label htmlFor="aceita_bolsa_minima">Aceito receber apenas bolsa mínima</label>
                </div>
              </Secao>

              {/* LINKS */}
              <Secao titulo="Links e currículo">
                <div className="row r1">
                  <Campo id="cv_url" label="Currículo (PDF)">
                    <input id="cv_url" name="cv_url" type="url" placeholder="https://drive.google.com/..." value={form.cv_url} onChange={handleChange}/>
                  </Campo>
                </div>
                <div className="row r1">
                  <Campo id="linkedin_url" label="LinkedIn">
                    <input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/seuperfil" value={form.linkedin_url} onChange={handleChange}/>
                  </Campo>
                </div>
                <div className="row r1">
                  <Campo id="portfolio_url" label="Portfólio">
                    <input id="portfolio_url" name="portfolio_url" type="url" placeholder="https://..." value={form.portfolio_url} onChange={handleChange}/>
                  </Campo>
                </div>
              </Secao>

              {/* BIO */}
              <Secao titulo="Bio">
                <div className="campo">
                  <label htmlFor="bio">Apresentação pessoal</label>
                  <textarea id="bio" name="bio" placeholder="Fale um pouco sobre você, seus objetivos e diferenciais..." value={form.bio} onChange={handleChange}/>
                  <div className="hint">Esse texto aparece no seu perfil público</div>
                </div>
              </Secao>

              {/* RODAPÉ */}
              <div className="foot">
                <button type="button" className="btn-back" onClick={() => window.history.back()}>← Voltar</button>
                <button type="button" className="btn-criar" onClick={handleSubmit} disabled={enviando}>
                  {enviando ? 'Salvando...' : 'Criar perfil'}
                </button>
              </div>
            </div>
          </main>
        )}
      </div>
    </>
  )
}
