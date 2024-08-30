import { Module } from '@nestjs/common'
import { RestaurantTypeService } from './restaurant-type.service'
import { RestaurantTypeController } from './restaurant-type.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { RestaurantType, RestaurantTypeSchema } from './model/restauran-type.model'

@Module({
  imports: [MongooseModule.forFeature([{ name: RestaurantType.name, schema: RestaurantTypeSchema }])],
  controllers: [RestaurantTypeController],
  providers: [RestaurantTypeService]
})
export class RestaurantTypeModule {}
