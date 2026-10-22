import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import fs from 'node:fs'

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('certs/private-key.pem'),
    cert: fs.readFileSync('certs/public.pem'),
  }

  const app = await NestFactory.create(AppModule, { httpsOptions })
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.enableCors({
    credentials: true,
    origin: 'http://localhost:3001',
  })
  app.use(cookieParser())
  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
