import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { DishesService } from './dishes.service'
import { Acccount, ResponseMessage } from 'src/decorator/customize'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { CreateDishDto } from './dto/create-dish.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateDishDto } from './dto/update-dish.dto'
import { UpdateStatusDishDto } from './dto/update-status-dish.dto'

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  @ResponseMessage('Thêm món ăn mới thành công')
  @UseGuards(AccountAuthGuard)
  async createDish(@Body() createDishDto: CreateDishDto, @Acccount() account: IAccount) {
    return await this.dishesService.createDish(createDishDto, account)
  }

  @Get()
  @ResponseMessage('Lấy danh sách món ăn thành công')
  @UseGuards(AccountAuthGuard)
  async findAllPagination(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ) {
    return await this.dishesService.findAllPagination({ currentPage: +currentPage, limit: +limit, qs }, account)
  }

  @Patch()
  @ResponseMessage('Cập nhật thông tin món ăn thành công')
  @UseGuards(AccountAuthGuard)
  async update(@Body() updateDishDto: UpdateDishDto, @Acccount() account: IAccount) {
    return await this.dishesService.update(updateDishDto, account)
  }

  @Patch('/restore/:id')
  @ResponseMessage('Khôi phục món ăn thành công')
  @UseGuards(AccountAuthGuard)
  async restore(@Param('id') id: string, @Acccount() account: IAccount) {
    return await this.dishesService.restore(id, account)
  }

  @Get('/list-dish-order/:id')
  @ResponseMessage('Lấy danh sách món ăn cho order')
  async findAllDishOrder(@Param('id') dish_restaurant_id: string) {
    return await this.dishesService.findAllDishOrder({
      dish_restaurant_id
    })
  }

  @Patch('update-status')
  @ResponseMessage('Cập nhật trạng thái món ăn thành công')
  @UseGuards(AccountAuthGuard)
  async updateStatus(@Body() updateStatusDishDto: UpdateStatusDishDto, @Acccount() account: IAccount) {
    return await this.dishesService.updateStatus(updateStatusDishDto, account)
  }

  @Get('/recycle')
  @ResponseMessage('Lấy danh sách món ăn đã xóa thành công')
  @UseGuards(AccountAuthGuard)
  async findAllRecycle(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ) {
    return await this.dishesService.findAllRecycle({ currentPage: +currentPage, limit: +limit, qs }, account)
  }

  @Delete('/:id')
  @ResponseMessage('Xóa món ăn thành công')
  @UseGuards(AccountAuthGuard)
  async remove(@Param('id') id: string, @Acccount() account: IAccount) {
    return await this.dishesService.remove(id, account)
  }

  @Get('/:id')
  @ResponseMessage('Lấy thông tin món ăn thành công')
  @UseGuards(AccountAuthGuard)
  async findOne(@Param('id') id: string, @Acccount() account: IAccount) {
    return await this.dishesService.findOne(id, account)
  }
}
