import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common'
import { OrderDishService } from './order-dish.service'
import { Acccount, GuestRestaurant, ResponseMessage } from 'src/decorator/customize'
import { GuestRestaurantAuthGuard } from 'src/guard/guest.guard'
import { CreateOrderDishDto } from './dto/create-order-dish.dto'
import { IGuest } from 'src/guest-restaurant/guest.interface'
import { UpdateStatusOrderDishDto } from './dto/update-status-order-dish.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { AccountAuthGuard } from 'src/guard/accounts.guard'

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

  // @Get('/list-order-restaurant')
  // @ResponseMessage('Danh sách món ăn đã đặt')
  // @UseGuards(AccountAuthGuard)
  // async listOrderRestaurant(
  //   @Query('current') currentPage: string,
  //   @Query('pageSize') limit: string,
  //   @Query() qs: string,
  //   @Acccount() account: IAccount
  // ) {
  //   return await this.orderDishService.listOrderRestaurant({ currentPage: +currentPage, limit: +limit, qs }, account)
  // }

  @Patch('/update-status')
  @ResponseMessage('Cập nhật trạng thái món ăn thành công')
  @UseGuards(AccountAuthGuard)
  async updateStatusOrderDish(
    @Body() updateStatusOrderDishDto: UpdateStatusOrderDishDto,
    @Acccount() account: IAccount
  ) {
    return this.orderDishService.updateStatusOrderDish(updateStatusOrderDishDto, account)
  }
}
