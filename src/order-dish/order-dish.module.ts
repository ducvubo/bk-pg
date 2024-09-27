import { Module } from '@nestjs/common'
import { OrderDishService } from './order-dish.service'
import { OrderDishController } from './order-dish.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { AccountsModule } from 'src/accounts/accounts.module'
import { RestaurantsModule } from 'src/restaurants/restaurants.module'
import { EmployeesModule } from 'src/employees/employees.module'
import { OrderDish, OrderDishSchema } from './model/order-dish.model'
import { DishDuplicate, DishDuplicateSchema } from './model/dish-duplicate.model'
import { OrderDishRepository } from './model/order-dish.repo'
import { GuestRestaurantModule } from 'src/guest-restaurant/guest-restaurant.module'
import { DishesModule } from 'src/dishes/dishes.module'
import { TablesModule } from 'src/tables/tables.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderDish.name, schema: OrderDishSchema },
      { name: DishDuplicate.name, schema: DishDuplicateSchema }
    ]),
    AccountsModule,
    RestaurantsModule,
    EmployeesModule,
    GuestRestaurantModule,
    TablesModule,
    DishesModule
  ],
  controllers: [OrderDishController],
  providers: [OrderDishService, OrderDishRepository]
})
export class OrderDishModule {}
