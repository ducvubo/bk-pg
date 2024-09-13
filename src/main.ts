import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TransformIntercaptor } from './interceptor/transform.interceptor'
import { join } from 'path'
import { initRedis } from './config/redis.config'
import { IdUserGuestInterceptor } from './interceptor/guestId.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const configService = app.get(ConfigService)

  const reflector = app.get(Reflector)

  app.useGlobalInterceptors(new TransformIntercaptor(reflector))
  app.useGlobalInterceptors(new IdUserGuestInterceptor())

  app.useGlobalPipes(new ValidationPipe())

  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.setBaseViewsDir(join(__dirname, '..', 'views'))
  app.setViewEngine('ejs')

  app.enableCors()
  initRedis()

  app.setGlobalPrefix('api')
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2']
  })

  // app.useGlobalFilters(new AllExceptionsFilter())
  await app.listen(configService.get<string>('PORT'))
}
bootstrap()
