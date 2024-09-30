import { forwardRef, Module } from '@nestjs/common'
import { DishesService } from './dishes.service'
import { DishesController } from './dishes.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { AccountsModule } from 'src/accounts/accounts.module'
import { RestaurantsModule } from 'src/restaurants/restaurants.module'
import { EmployeesModule } from 'src/employees/employees.module'
import { Dish, DishSchema } from './model/dishes.model'
import { DishRepository } from './model/dishes.repo'
import { GuestRestaurantModule } from 'src/guest-restaurant/guest-restaurant.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Dish.name, schema: DishSchema }]),
    AccountsModule,
    RestaurantsModule,
    EmployeesModule,
    forwardRef(() => GuestRestaurantModule)
    // GuestRestaurantModule
  ],
  controllers: [DishesController],
  providers: [DishesService, DishRepository],
  exports: [DishRepository, DishesService]
})
export class DishesModule {}
