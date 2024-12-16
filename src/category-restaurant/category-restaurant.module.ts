import { Module } from '@nestjs/common'
import { CategoryRestaurantService } from './category-restaurant.service'
import { CategoryRestaurantController } from './category-restaurant.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { CategoryRestaurant, CategoryRestaurantSchema } from './model/category-restaurant.model'
import { AccountsModule } from 'src/accounts/accounts.module'
import { RestaurantsModule } from 'src/restaurants/restaurants.module'
import { EmployeesModule } from 'src/employees/employees.module'
import { CategoryRestauranRepository } from './model/category-restaurant.repo'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CategoryRestaurant.name, schema: CategoryRestaurantSchema }]),
    AccountsModule,
    RestaurantsModule,
    EmployeesModule
  ],
  controllers: [CategoryRestaurantController],
  providers: [CategoryRestaurantService, CategoryRestauranRepository]
})
export class CategoryRestaurantModule {}
