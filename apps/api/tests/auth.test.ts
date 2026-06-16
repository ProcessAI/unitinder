import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app'

const CNPJ_VALIDO = '11.222.333/0001-81'
const CNPJ_VALIDO_DIGITOS = '11222333000181'

describe('Auth - cadastro e login de empresa (CNPJ)', () => {
  it('cadastra uma empresa com CNPJ válido de 14 dígitos', async () => {
    const response = await request(app).post('/auth/registro/empresa').send({
      nomeEmpresa: 'Tech Solutions',
      cnpj: CNPJ_VALIDO,
      email: 'contato@techsolutions.com',
      senha: 'senha123',
      setor: 'tecnologia',
      cidade: 'São Paulo',
      descricao: 'Empresa de tecnologia',
    })

    expect(response.status).toBe(201)
    expect(response.body.token).toBeTypeOf('string')
    expect(response.body.role).toBe('empresa')
    expect(response.body.empresa.cnpj).toBe(CNPJ_VALIDO_DIGITOS)
  })

  it('rejeita CNPJ com menos de 14 dígitos', async () => {
    const response = await request(app).post('/auth/registro/empresa').send({
      nomeEmpresa: 'Empresa Inválida',
      cnpj: '123456',
      email: 'invalida@empresa.com',
      senha: 'senha123',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/CNPJ inválido/)
  })

  it('rejeita CNPJ com 14 dígitos mas dígito verificador incorreto', async () => {
    const response = await request(app).post('/auth/registro/empresa').send({
      nomeEmpresa: 'Empresa Inválida',
      cnpj: '11222333000199',
      email: 'invalida2@empresa.com',
      senha: 'senha123',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/CNPJ inválido/)
  })

  it('rejeita CNPJ duplicado', async () => {
    await request(app).post('/auth/registro/empresa').send({
      nomeEmpresa: 'Tech Solutions',
      cnpj: CNPJ_VALIDO,
      email: 'contato@techsolutions.com',
      senha: 'senha123',
    })

    const response = await request(app).post('/auth/registro/empresa').send({
      nomeEmpresa: 'Outra Empresa',
      cnpj: CNPJ_VALIDO,
      email: 'outra@empresa.com',
      senha: 'senha123',
    })

    expect(response.status).toBe(409)
  })

  it('faz login da empresa usando o CNPJ (14 dígitos) e a senha cadastrada', async () => {
    await request(app).post('/auth/registro/empresa').send({
      nomeEmpresa: 'Tech Solutions',
      cnpj: CNPJ_VALIDO,
      email: 'contato@techsolutions.com',
      senha: 'senha123',
    })

    const response = await request(app).post('/auth/login').send({
      identificador: CNPJ_VALIDO,
      senha: 'senha123',
    })

    expect(response.status).toBe(200)
    expect(response.body.role).toBe('empresa')
    expect(response.body.token).toBeTypeOf('string')
  })

  it('rejeita login de empresa com senha incorreta', async () => {
    await request(app).post('/auth/registro/empresa').send({
      nomeEmpresa: 'Tech Solutions',
      cnpj: CNPJ_VALIDO,
      email: 'contato@techsolutions.com',
      senha: 'senha123',
    })

    const response = await request(app).post('/auth/login').send({
      identificador: CNPJ_VALIDO_DIGITOS,
      senha: 'senha_errada',
    })

    expect(response.status).toBe(401)
  })
})

describe('Auth - cadastro e login de estagiário (e-mail)', () => {
  it('cadastra um estagiário e retorna token', async () => {
    const response = await request(app).post('/auth/registro/usuario').send({
      nome: 'Ana Lima',
      email: 'ana.lima@email.com',
      senha: 'senha123',
      cpf: '12345678901',
    })

    expect(response.status).toBe(201)
    expect(response.body.role).toBe('estagiario')
    expect(response.body.estagiario.email).toBe('ana.lima@email.com')
  })

  it('rejeita CPF com formato inválido', async () => {
    const response = await request(app).post('/auth/registro/usuario').send({
      nome: 'Ana Lima',
      email: 'ana2@email.com',
      senha: 'senha123',
      cpf: '123',
    })

    expect(response.status).toBe(400)
  })

  it('faz login do estagiário usando e-mail e senha', async () => {
    await request(app).post('/auth/registro/usuario').send({
      nome: 'Ana Lima',
      email: 'ana.lima@email.com',
      senha: 'senha123',
      cpf: '12345678901',
    })

    const response = await request(app).post('/auth/login').send({
      identificador: 'ana.lima@email.com',
      senha: 'senha123',
    })

    expect(response.status).toBe(200)
    expect(response.body.role).toBe('estagiario')
  })

  it('rejeita login com e-mail inexistente', async () => {
    const response = await request(app).post('/auth/login').send({
      identificador: 'naoexiste@email.com',
      senha: 'qualquer',
    })

    expect(response.status).toBe(401)
  })
})
