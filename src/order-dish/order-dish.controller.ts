import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { OrderDishService } from './order-dish.service'
import { GuestRestaurant, ResponseMessage } from 'src/decorator/customize'
import { GuestRestaurantAuthGuard } from 'src/guard/guest.guard'
import { CreateOrderDishDto } from './dto/create-order-dish.dto'
import { IGuest } from 'src/guest-restaurant/guest.interface'

@Controller('order-dish')
export class OrderDishController {
  constructor(private readonly orderDishService: OrderDishService) {}

  @Post()
  @ResponseMessage('Đặt món ăn thành công')
  @UseGuards(GuestRestaurantAuthGuard)
  async createOrderDish(@Body() createOrderDishDto: CreateOrderDishDto[], @GuestRestaurant() guest: IGuest) {
    return this.orderDishService.createOrderDish(createOrderDishDto, guest)
  }

  @Get('/list-order-guest')
  @ResponseMessage('Danh sách món ăn đã đặt')
  @UseGuards(GuestRestaurantAuthGuard)
  async listOrderGuest(@GuestRestaurant() guest: IGuest) {
    return this.orderDishService.listOrderGuest(guest)
  }
}
