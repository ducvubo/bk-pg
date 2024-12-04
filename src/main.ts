import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TransformIntercaptor } from './interceptor/transform.interceptor'
import { join } from 'path'
import { initRedis } from './config/redis.config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { IdUserGuestInterceptor } from './interceptor/guestId.interceptor'

export const redisConfig = {
  host: String(process.env.REDIS_HOST),
  port: Number(process.env.REDIS_PORT),
  password: String(process.env.REDIS_PASSWORD)
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const configService = app.get(ConfigService)

  app.useGlobalPipes(new ValidationPipe())
  const reflector = app.get(Reflector)

  app.useGlobalInterceptors(new TransformIntercaptor(reflector))
  app.useGlobalInterceptors(new IdUserGuestInterceptor(reflector))

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

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  // app.useGlobalFilters(new AllExceptionsFilter())
  await app.listen(configService.get<string>('PORT'))
}
bootstrap()
