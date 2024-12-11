import { Controller, Get, UseGuards, Query, Patch, Body, Post } from '@nestjs/common'
import { OrderDishSummaryService } from './order-dish-summary.service'
import { Acccount, ResponseMessage } from 'src/decorator/customize'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateStatusOrderSummaryDto } from './dto/update-status-summary.dto'
import { OrderDishSummaryDocument } from './model/order-dish-summary.model'

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
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number; statusCount: any }
    result: any[]
  }> {
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
  ): Promise<OrderDishSummaryDocument> {
    return this.orderDishSummaryService.updateStatusOrderDishSummay(updateStatusOrderSummaryDto, account)
  }

  @Get('/list-ordering')
  @ResponseMessage('Danh sách đang order')
  @UseGuards(AccountAuthGuard)
  async listOrdering(@Acccount() account: IAccount): Promise<OrderDishSummaryDocument[]> {
    return await this.orderDishSummaryService.listOrdering(account)
  }

  @Post('/create-order-dish-summary')
  @ResponseMessage('Tạo đơn hàng mới thành công')
  @UseGuards(AccountAuthGuard)
  async createOrderDishSummary(
    @Body('od_dish_smr_table_id') od_dish_smr_table_id: string,
    @Acccount() account: IAccount
  ): Promise<OrderDishSummaryDocument> {
    return await this.orderDishSummaryService.createOrderDishSummary(od_dish_smr_table_id, account)
  }

  @Get('/list-order-summary-by-table')
  @ResponseMessage('Danh sách đơn hàng theo bàn')
  @UseGuards(AccountAuthGuard)
  async listOrderSummaryByTable(
    @Query('od_dish_smr_table_id') od_dish_smr_table_id: string,
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: OrderDishSummaryDocument[]
  }> {
    return await this.orderDishSummaryService.listOrderSummaryByTable(
      { currentPage: +currentPage, limit: +limit, qs },
      od_dish_smr_table_id,
      account
    )
  }
}
