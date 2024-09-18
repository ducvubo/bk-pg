import { Module } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { AccountsController } from './accounts.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Accounts, AccountsSchema } from './model/accounts.model'
import { AccountRepository } from './model/accounts.repo'
import { RefreshTokenAccount, RefreshTokenAccountSchema } from './model/refresh-token.model'
import { RefreshTokenAccountRepository } from './model/refresh-token.repo'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accounts.name, schema: AccountsSchema },
      { name: RefreshTokenAccount.name, schema: RefreshTokenAccountSchema }
    ]),
    JwtModule.register({})
  ],
  controllers: [AccountsController],
  providers: [AccountsService, AccountRepository, RefreshTokenAccountRepository],
  exports: [AccountsService, AccountRepository]
})
export class AccountsModule {}
