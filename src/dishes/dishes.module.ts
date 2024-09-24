import { Module } from '@nestjs/common'
import { DishesService } from './dishes.service'
import { DishesController } from './dishes.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { AccountsModule } from 'src/accounts/accounts.module'
import { RestaurantsModule } from 'src/restaurants/restaurants.module'
import { EmployeesModule } from 'src/employees/employees.module'
import { Dish, DishSchema } from './model/dishes.model'
import { DishRepository } from './model/dishes.repo'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Dish.name, schema: DishSchema }]),
    AccountsModule,
    RestaurantsModule,
    EmployeesModule
  ],
  controllers: [DishesController],
  providers: [DishesService, DishRepository]
})
export class DishesModule {}
