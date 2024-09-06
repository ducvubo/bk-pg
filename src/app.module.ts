import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RestaurantsModule } from './restaurants/restaurants.module'
import { MongooseModule } from '@nestjs/mongoose'
import { AmenitiesModule } from './amenities/amenities.module'
import { CategoryModule } from './category/category.module'
import { RestaurantTypeModule } from './restaurant-type/restaurant-type.module'
import { UploadModule } from './upload/upload.module'
import { UsersModule } from './users/users.module'
import { MailModule } from './mail/mail.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL')
      })
    }),
    RestaurantsModule,
    AmenitiesModule,
    CategoryModule,
    RestaurantTypeModule,
    UploadModule,
    UsersModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
