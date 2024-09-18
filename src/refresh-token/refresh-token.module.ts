import { Module } from '@nestjs/common'
import { RefreshTokenService } from './refresh-token.service'
import { RefreshTokenController } from './refresh-token.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { RefreshTokenCPAndEPL, RefreshTokenCPAndEPLSchema } from './model/refresh-token.model'
import { JwtModule } from '@nestjs/jwt'
import { RefreshTokenCPAndEPLRepository } from './model/refresh-token.repo'

// dành cho nhà hàng và nhân viên
@Module({
  imports: [
    MongooseModule.forFeature([{ name: RefreshTokenCPAndEPL.name, schema: RefreshTokenCPAndEPLSchema }]),
    JwtModule.register({})
  ],
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService, RefreshTokenCPAndEPLRepository],
  exports: [RefreshTokenService, RefreshTokenCPAndEPLRepository]
})
export class RefreshTokenModule {}
