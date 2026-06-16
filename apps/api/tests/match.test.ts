import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../src/app'

const CNPJ_VALIDO = '11.222.333/0001-81'

async function criarEmpresaComToken() {
  const registro = await request(app).post('/auth/registro/empresa').send({
    nomeEmpresa: 'Tech Solutions',
    cnpj: CNPJ_VALIDO,
    email: 'contato@techsolutions.com',
    senha: 'senha123',
  })

  return { token: registro.body.token as string, idEmpresa: registro.body.empresa.id as number }
}

async function criarEstagiarioComToken(email = 'ana.lima@email.com', cpf = '12345678901') {
  const registro = await request(app).post('/auth/registro/usuario').send({
    nome: 'Ana Lima',
    email,
    senha: 'senha123',
    cpf,
  })

  return { token: registro.body.token as string, idEstagiario: registro.body.estagiario.id as number }
}

async function criarVaga(token: string, idEmpresa: number) {
  const response = await request(app)
    .post('/vagas')
    .set('Authorization', `Bearer ${token}`)
    .send({
      id_empresa_empresa: idEmpresa,
      vaga_titulo: 'Estágio em Desenvolvimento Frontend',
      vaga_descricao: 'Vaga para estágio',
      vaga_area: 'Tecnologia',
    })

  return response.body.id_vaga as number
}

describe('Match - candidatura de estagiário a vaga', () => {
  it('estagiário se candidata a uma vaga com sucesso', async () => {
    const empresa = await criarEmpresaComToken()
    const estagiario = await criarEstagiarioComToken()
    const idVaga = await criarVaga(empresa.token, empresa.idEmpresa)

    const response = await request(app)
      .post('/matches')
      .set('Authorization', `Bearer ${estagiario.token}`)
      .send({ id_estagiario_estagiario: estagiario.idEstagiario, id_vaga_vagas: idVaga })

    expect(response.status).toBe(201)
    expect(response.body.match_status).toBe('PENDENTE')
  })

  it('bloqueia candidatura sem autenticação', async () => {
    const empresa = await criarEmpresaComToken()
    const estagiario = await criarEstagiarioComToken()
    const idVaga = await criarVaga(empresa.token, empresa.idEmpresa)

    const response = await request(app)
      .post('/matches')
      .send({ id_estagiario_estagiario: estagiario.idEstagiario, id_vaga_vagas: idVaga })

    expect(response.status).toBe(401)
  })

  it('bloqueia uma empresa de criar candidatura (apenas estagiário pode)', async () => {
    const empresa = await criarEmpresaComToken()
    const estagiario = await criarEstagiarioComToken()
    const idVaga = await criarVaga(empresa.token, empresa.idEmpresa)

    const response = await request(app)
      .post('/matches')
      .set('Authorization', `Bearer ${empresa.token}`)
      .send({ id_estagiario_estagiario: estagiario.idEstagiario, id_vaga_vagas: idVaga })

    expect(response.status).toBe(403)
  })

  it('impede candidatura duplicada na mesma vaga', async () => {
    const empresa = await criarEmpresaComToken()
    const estagiario = await criarEstagiarioComToken()
    const idVaga = await criarVaga(empresa.token, empresa.idEmpresa)

    await request(app)
      .post('/matches')
      .set('Authorization', `Bearer ${estagiario.token}`)
      .send({ id_estagiario_estagiario: estagiario.idEstagiario, id_vaga_vagas: idVaga })

    const response = await request(app)
      .post('/matches')
      .set('Authorization', `Bearer ${estagiario.token}`)
      .send({ id_estagiario_estagiario: estagiario.idEstagiario, id_vaga_vagas: idVaga })

    expect(response.status).toBe(409)
  })

  it('empresa aceita a candidatura de um estagiário', async () => {
    const empresa = await criarEmpresaComToken()
    const estagiario = await criarEstagiarioComToken()
    const idVaga = await criarVaga(empresa.token, empresa.idEmpresa)

    const candidatura = await request(app)
      .post('/matches')
      .set('Authorization', `Bearer ${estagiario.token}`)
      .send({ id_estagiario_estagiario: estagiario.idEstagiario, id_vaga_vagas: idVaga })

    const response = await request(app)
      .patch(`/matches/${candidatura.body.id_match}/status`)
      .set('Authorization', `Bearer ${empresa.token}`)
      .send({ status: 'aceito' })

    expect(response.status).toBe(200)
    expect(response.body.match_status).toBe('ACEITO')
  })

  it('estagiário não pode alterar o status de uma candidatura (apenas empresa)', async () => {
    const empresa = await criarEmpresaComToken()
    const estagiario = await criarEstagiarioComToken()
    const idVaga = await criarVaga(empresa.token, empresa.idEmpresa)

    const candidatura = await request(app)
      .post('/matches')
      .set('Authorization', `Bearer ${estagiario.token}`)
      .send({ id_estagiario_estagiario: estagiario.idEstagiario, id_vaga_vagas: idVaga })

    const response = await request(app)
      .patch(`/matches/${candidatura.body.id_match}/status`)
      .set('Authorization', `Bearer ${estagiario.token}`)
      .send({ status: 'aceito' })

    expect(response.status).toBe(403)
  })

  it('lista os matches de um estagiário', async () => {
    const empresa = await criarEmpresaComToken()
    const estagiario = await criarEstagiarioComToken()
    const idVaga = await criarVaga(empresa.token, empresa.idEmpresa)

    await request(app)
      .post('/matches')
      .set('Authorization', `Bearer ${estagiario.token}`)
      .send({ id_estagiario_estagiario: estagiario.idEstagiario, id_vaga_vagas: idVaga })

    const response = await request(app)
      .get(`/matches/estagiario/${estagiario.idEstagiario}`)
      .set('Authorization', `Bearer ${estagiario.token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0].vaga.id_vaga).toBe(idVaga)
  })

  it('lista os candidatos de uma vaga', async () => {
    const empresa = await criarEmpresaComToken()
    const estagiario = await criarEstagiarioComToken()
    const idVaga = await criarVaga(empresa.token, empresa.idEmpresa)

    await request(app)
      .post('/matches')
      .set('Authorization', `Bearer ${estagiario.token}`)
      .send({ id_estagiario_estagiario: estagiario.idEstagiario, id_vaga_vagas: idVaga })

    const response = await request(app)
      .get(`/matches/vaga/${idVaga}`)
      .set('Authorization', `Bearer ${empresa.token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0].estagiario.id_estagiario).toBe(estagiario.idEstagiario)
  })
})
