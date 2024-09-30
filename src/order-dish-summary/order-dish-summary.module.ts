import { forwardRef, Module } from '@nestjs/common'
import { OrderDishSummaryService } from './order-dish-summary.service'
import { OrderDishSummaryController } from './order-dish-summary.controller'
import { OrderDishSummaryRepository } from './model/order-dish-summary.repo'
import { MongooseModule } from '@nestjs/mongoose'
import { OrderDishSummary, OrderDishSummarySchema } from './model/order-dish-summary.model'
import { GuestRestaurantModule } from 'src/guest-restaurant/guest-restaurant.module'
import { TablesModule } from 'src/tables/tables.module'
import { OrderDishModule } from 'src/order-dish/order-dish.module'
import { AccountsModule } from 'src/accounts/accounts.module'
import { EmployeesModule } from 'src/employees/employees.module'
import { RestaurantsModule } from 'src/restaurants/restaurants.module'
import { SocketModule } from 'src/socket/socket.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OrderDishSummary.name, schema: OrderDishSummarySchema }]),
    forwardRef(() => GuestRestaurantModule),
    forwardRef(() => OrderDishModule),
    forwardRef(() => TablesModule),
    SocketModule,
    AccountsModule,
    EmployeesModule,
    RestaurantsModule
  ],
  controllers: [OrderDishSummaryController],
  providers: [OrderDishSummaryService, OrderDishSummaryRepository],
  exports: [OrderDishSummaryService, OrderDishSummaryRepository]
})
export class OrderDishSummaryModule {}
