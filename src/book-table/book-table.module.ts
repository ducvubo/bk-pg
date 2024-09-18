import { forwardRef, Module } from '@nestjs/common'
import { BookTableService } from './book-table.service'
import { BookTableController } from './book-table.controller'
import { BookTableRepository } from './model/book-table.repo'
import { MongooseModule } from '@nestjs/mongoose'
import { BookTable, BookTableSchema } from './model/book-table.model'
import { RestaurantsModule } from 'src/restaurants/restaurants.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MailModule } from 'src/mail/mail.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BookTable.name, schema: BookTableSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_CONFIRM_BOOK_TABLE_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_CONFIRM_BOOK_TABLE_EXPIRE')
        }
      }),
      inject: [ConfigService]
    }),
    forwardRef(() => RestaurantsModule),
    forwardRef(() => UsersModule),
    MailModule
  ],
  controllers: [BookTableController],
  providers: [BookTableService, BookTableRepository],
  exports: [BookTableService, BookTableRepository]
})
export class BookTableModule {}
