import { Module } from '@nestjs/common'
import { RestaurantsService } from './restaurants.service'
import { RestaurantsController } from './restaurants.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Restaurant, RestaurantSchema } from './model/restaurant.model'
import { RestaurantRepository } from './model/restaurant.repo'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }]), UsersModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, RestaurantRepository]
})
export class RestaurantsModule {}
