import { Module } from '@nestjs/common'
import { RestaurantsService } from './restaurants.service'
import { RestaurantsController } from './restaurants.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Restaurant, RestaurantSchema } from './model/restaurant.model'
import { RestaurantRepository } from './model/restaurant.repo'

@Module({
  imports: [MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, RestaurantRepository]
})
export class RestaurantsModule {}
