import { Controller, Post, Body, Get, Query, Param, Patch, Delete, UseGuards } from '@nestjs/common'
import { RestaurantsService } from './restaurants.service'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { ResponseMessage } from 'src/decorator/customize'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { UpdateVerify } from './dto/update-verify.dto'
import { UpdateState } from './dto/update-state.dto'
import { UpdateStatus } from './dto/update-status.dt'
import { UserAuthGuard } from 'src/guard/users.guard'

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Tạo nhà hàng thành công')
  async create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return await this.restaurantsService.create(createRestaurantDto)
  }

  @Get()
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Lấy tất cả nhà hàng thành công')
  async findAll(@Query('current') currentPage: string, @Query('pageSize') limit: string, @Query() qs: string) {
    return await this.restaurantsService.findAll({ currentPage: +currentPage, limit: +limit, qs })
  }

  @Patch()
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Cập nhật thông tin nhà hàng thành công')
  async update(@Body() updateRestaurantDto: UpdateRestaurantDto) {
    return await this.restaurantsService.update(updateRestaurantDto)
  }

  @Patch('/verify')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Cập nhật trạng thái xác thực nhà hàng thành công')
  async updateVerify(@Body() updatevVerify: UpdateVerify) {
    return await this.restaurantsService.updateVerify(updatevVerify)
  }

  @Patch('/state')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Cập nhật trạng thái mở cửa của nhà hàng hoạt động thành công')
  async updateState(@Body() updateState: UpdateState) {
    return await this.restaurantsService.updateState(updateState)
  }

  @Patch('/status')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Cập nhật trạng thái hoạt động của nhà hàng thành công')
  async updateStatus(@Body() updateStatus: UpdateStatus) {
    return await this.restaurantsService.updateStatus(updateStatus)
  }

  @Get('/recycle')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Lấy tất cả nhà hàng đã xóa thành công')
  async findAllRecycle(@Query('current') currentPage: string, @Query('pageSize') limit: string, @Query() qs: string) {
    return await this.restaurantsService.findAllRecycle({ currentPage: +currentPage, limit: +limit, qs })
  }

  @Patch('/restore/:id')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Khôi phục nhà hàng đã xóa thành công')
  async restore(@Param('id') _id: string) {
    return await this.restaurantsService.restore({ _id })
  }

  @Delete('/:id')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Xóa nhà hàng thành công')
  async remove(@Param('id') _id: string) {
    return await this.restaurantsService.remove({ _id })
  }
  @Get('/:id')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Lấy thông tin nhà hàng theo id thành công')
  async findOne(@Param('id') _id: string) {
    return await this.restaurantsService.findOne({ _id })
  }
}
