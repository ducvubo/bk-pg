import { Module } from '@nestjs/common'
import { UploadService } from './upload.service'
import { UploadController } from './upload.controller'
import { ConfigModule } from '@nestjs/config'
import { MulterModule } from '@nestjs/platform-express'
import { MulterConfigService } from 'src/config/multer.config'

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService
    }),
    // MulterModule.registerAsync({}),
    ConfigModule
  ],
  controllers: [UploadController],
  providers: [UploadService]
})
export class UploadModule {}
