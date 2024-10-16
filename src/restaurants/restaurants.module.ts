import { Module } from '@nestjs/common'
import { RestaurantsService } from './restaurants.service'
import { RestaurantsController } from './restaurants.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Restaurant, RestaurantSchema } from './model/restaurant.model'
import { RestaurantRepository } from './model/restaurant.repo'
import { UsersModule } from 'src/users/users.module'
import { AccountsModule } from 'src/accounts/accounts.module'
import { EmployeesModule } from 'src/employees/employees.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }]),
    UsersModule,
    AccountsModule,
    EmployeesModule
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, RestaurantRepository],
  exports: [RestaurantRepository, RestaurantsService]
})
export class RestaurantsModule {}
