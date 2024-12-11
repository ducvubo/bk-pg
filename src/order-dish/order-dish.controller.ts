import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common'
import { OrderDishService } from './order-dish.service'
import { Acccount, GuestRestaurant, ResponseMessage } from 'src/decorator/customize'
import { GuestRestaurantAuthGuard } from 'src/guard/guest.guard'
import { CreateOrderDishDto, RestaurantCreateOrderDishDto } from './dto/create-order-dish.dto'
import { IGuest } from 'src/guest-restaurant/guest.interface'
import { UpdateStatusOrderDishDto } from './dto/update-status-order-dish.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { OrderDishDocument } from './model/order-dish.model'

@Controller('order-dish')
export class OrderDishController {
  constructor(private readonly orderDishService: OrderDishService) {}

  @Post()
  @ResponseMessage('Đặt món ăn thành công')
  @UseGuards(GuestRestaurantAuthGuard)
  async createOrderDish(
    @Body() createOrderDishDto: CreateOrderDishDto[],
    @GuestRestaurant() guest: IGuest
  ): Promise<OrderDishDocument> {
    return this.orderDishService.createOrderDish(createOrderDishDto, guest)
  }

  @Get('/list-order-guest')
  @ResponseMessage('Danh sách món ăn đã đặt')
  @UseGuards(GuestRestaurantAuthGuard)
  async listOrderGuest(@GuestRestaurant() guest: IGuest): Promise<{
    _id: string
    od_dish_smr_restaurant_id: string
    od_dish_smr_guest_id: string
    od_dish_smr_table_id: string
    od_dish_smr_status: string
    or_dish: any
  }> {
    return this.orderDishService.listOrderGuest(guest)
  }

  @Patch('/update-status')
  @ResponseMessage('Cập nhật trạng thái món ăn thành công')
  @UseGuards(AccountAuthGuard)
  async updateStatusOrderDish(
    @Body() updateStatusOrderDishDto: UpdateStatusOrderDishDto,
    @Acccount() account: IAccount
  ): Promise<OrderDishDocument> {
    return this.orderDishService.updateStatusOrderDish(updateStatusOrderDishDto, account)
  }

  @Post('/restaurant-create-order-dish')
  @ResponseMessage('Tạo order thành công')
  @UseGuards(AccountAuthGuard)
  async restaurantCreateOrderDish(
    @Body() restaurantCreateOrderDishDto: RestaurantCreateOrderDishDto,
    @Acccount() account: IAccount
  ): Promise<{
    od_dish_summary_id: string
    od_dish_smr_restaurant_id: string
    od_dish_smr_guest_id: string
    od_dish_smr_table_id: string
    od_dish_smr_status: string
    or_dish: any
  } | null> {
    return this.orderDishService.restaurantCreateOrderDish(restaurantCreateOrderDishDto, account)
  }
}
