import { beforeEach } from 'vitest'
import { prisma } from '../src/lib/prisma'

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "match", "rl_estagiario_habilidade", "rl_vaga_habilidade", "vagas", "usuario", "estagiario", "habilidade", "empresa" RESTART IDENTITY CASCADE'
  )
})
