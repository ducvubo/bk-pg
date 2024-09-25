import { Module } from '@nestjs/common'
import { GuestRestaurantService } from './guest-restaurant.service'
import { GuestRestaurantController } from './guest-restaurant.controller'
import { GuestRestaurantRepository } from './model/guest-restaurant.repo'
import { MongooseModule } from '@nestjs/mongoose'
import { GuestRestaurant, GuestRestaurantSchema } from './model/guest-restaurant.model'
import { JwtModule } from '@nestjs/jwt'
import { RestaurantsModule } from 'src/restaurants/restaurants.module'
import { TablesModule } from 'src/tables/tables.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GuestRestaurant.name, schema: GuestRestaurantSchema }]),
    JwtModule.register({}),
    RestaurantsModule,
    TablesModule
  ],
  controllers: [GuestRestaurantController],
  providers: [GuestRestaurantService, GuestRestaurantRepository],
  exports: [GuestRestaurantService]
})
export class GuestRestaurantModule {}