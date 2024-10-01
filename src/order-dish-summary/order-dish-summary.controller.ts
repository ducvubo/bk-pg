import { Controller, Get, UseGuards, Query, Patch, Body } from '@nestjs/common'
import { OrderDishSummaryService } from './order-dish-summary.service'
import { Acccount, ResponseMessage } from 'src/decorator/customize'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateStatusOrderSummaryDto } from './dto/update-status-summary.dto'

@Controller('order-dish-summary')
export class OrderDishSummaryController {
  constructor(private readonly orderDishSummaryService: OrderDishSummaryService) {}

  @Get('/list-order-restaurant')
  @ResponseMessage('Danh sách món ăn đã đặt')
  @UseGuards(AccountAuthGuard)
  async listOrderRestaurant(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ) {
    return await this.orderDishSummaryService.listOrderRestaurant(
      { currentPage: +currentPage, limit: +limit, qs },
      account
    )
  }

  @Patch('/update-status')
  @ResponseMessage('Cập nhật trạng thái món ăn thành công')
  @UseGuards(AccountAuthGuard)
  async updateStatusOrderDish(
    @Body() updateStatusOrderSummaryDto: UpdateStatusOrderSummaryDto,
    @Acccount() account: IAccount
  ) {
    return this.orderDishSummaryService.updateStatusOrderDishSummay(updateStatusOrderSummaryDto, account)
  }

  @Get('/list-ordering')
  @ResponseMessage('Danh sách đang order')
  @UseGuards(AccountAuthGuard)
  async listOrdering(@Acccount() account: IAccount) {
    return await this.orderDishSummaryService.listOrdering(account)
  }
}
