import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes'
import usuarioRoutes from './routes/usuario.routes'
import empresaRoutes from './routes/empresa.routes'
import estagiarioRoutes from './routes/estagiario.routes'
import vagaRoutes from './routes/vaga.routes'
import matchRoutes from './routes/match.routes'
import habilidadeRoutes from './routes/habilidade.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/usuarios', usuarioRoutes)
app.use('/empresas', empresaRoutes)
app.use('/estagiarios', estagiarioRoutes)
app.use('/vagas', vagaRoutes)
app.use('/matches', matchRoutes)
app.use('/habilidades', habilidadeRoutes)

export default app
