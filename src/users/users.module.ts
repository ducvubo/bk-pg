import { forwardRef, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './model/user.model'
import { UserRepository } from './model/user.repo'
import { MailModule } from 'src/mail/mail.module'
import { JwtModule } from '@nestjs/jwt'
import { RefreshTokenUserRepository } from './model/refresh-token.repo'
import { RefreshTokenUser, RefreshTokenUserSchema } from './model/refresh-token.model'
import { UnauthorizedExceptionFilter } from 'src/filter'
import { APP_FILTER } from '@nestjs/core'
import { BookTableModule } from 'src/book-table/book-table.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshTokenUser.name, schema: RefreshTokenUserSchema }
    ]),
    JwtModule.register({}),
    MailModule,
    forwardRef(() => BookTableModule)
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    RefreshTokenUserRepository,
    {
      provide: APP_FILTER,
      useClass: UnauthorizedExceptionFilter
    }
  ],
  exports: [UsersService]
})
export class UsersModule {}
