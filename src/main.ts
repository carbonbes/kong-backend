import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import session from 'express-session'
import { REDIS_CLIENT } from '@/redis-om/consts'
import { RedisClient } from '@/redis-om/types'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.enableCors()

  const redisClient = app.get<RedisClient>(REDIS_CLIENT)

  app.use(
    session({
      cookie: {
        domain: process.env.DOMAIN,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      },
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
      store: redisClient,
    }),
  )

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
