import { Controller, Post, Body, Get, Query, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common'
import { RestaurantsService } from './restaurants.service'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { Acccount, ResponseMessage, User } from 'src/decorator/customize'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { UpdateVerify } from './dto/update-verify.dto'
import { UpdateState } from './dto/update-state.dto'
import { UpdateStatus } from './dto/update-status.dt'
import { UserAuthGuard } from 'src/guard/users.guard'
import { IUser } from 'src/users/users.interface'
import { LoginRestaurantDto } from './dto/login-restaurant.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { AccountAuthGuard } from 'src/guard/accounts.guard'

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Tạo nhà hàng thành công')
  async create(@Body() createRestaurantDto: CreateRestaurantDto, @User() user: IUser) {
    return await this.restaurantsService.create(createRestaurantDto, user)
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
  async update(@Body() updateRestaurantDto: UpdateRestaurantDto, @User() user: IUser) {
    return await this.restaurantsService.update(updateRestaurantDto, user)
  }

  @Post('/login')
  @ResponseMessage('Đăng nhập nhà hàng thành công')
  async loginRestaurant(@Body() loginRestaurantDto: LoginRestaurantDto) {
    return await this.restaurantsService.loginRestaurant(loginRestaurantDto)
  }

  @Get('/infor')
  @UseGuards(AccountAuthGuard)
  @ResponseMessage('Lấy thông tin nhà hàng thành công')
  async getInforRestaurant(@Acccount() account: IAccount) {
    return this.restaurantsService.getInforRestaurant(account)
  }

  @Post('/refresh-token')
  @ResponseMessage('Làm mới token thành công')
  async refreshToken(@Req() req: Request) {
    const refresh_token = req.headers['authorization']?.split(' ')[1]
    return await this.restaurantsService.refreshToken({ refresh_token })
  }

  @Get('/home')
  @ResponseMessage('Lấy nhà hàng đang hoạt thành công')
  async findRestaurantsHome() {
    return await this.restaurantsService.findRestaurantsHome()
  }

  @Get('/slug/:slug')
  @ResponseMessage('Lấy thông tin nhà hàng theo slug thành công')
  async findOneBySlug(@Param('slug') restaurant_slug: string) {
    return await this.restaurantsService.findOneBySlug({ restaurant_slug })
  }

  @Patch('/verify')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Cập nhật trạng thái xác thực nhà hàng thành công')
  async updateVerify(@Body() updatevVerify: UpdateVerify, @User() user: IUser) {
    return await this.restaurantsService.updateVerify(updatevVerify, user)
  }

  @Patch('/state')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Cập nhật trạng thái mở cửa của nhà hàng hoạt động thành công')
  async updateState(@Body() updateState: UpdateState, @User() user: IUser) {
    return await this.restaurantsService.updateState(updateState, user)
  }

  @Patch('/status')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Cập nhật trạng thái hoạt động của nhà hàng thành công')
  async updateStatus(@Body() updateStatus: UpdateStatus, @User() user: IUser) {
    return await this.restaurantsService.updateStatus(updateStatus, user)
  }

  @Get('/recycle')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Lấy tất cả nhà hàng đã xóa thành công')
  async findAllRecycle(@Query('current') currentPage: string, @Query('pageSize') limit: string, @Query() qs: string) {
    return await this.restaurantsService.findAllRecycle({ currentPage: +currentPage, limit: +limit, qs })
  }

  @Get('/search-login-employee')
  @ResponseMessage('Tìm kiếm nhà hàng thành công')
  async search(@Query('search') q: string) {
    return await this.restaurantsService.search({ q })
  }

  @Patch('/restore/:id')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Khôi phục nhà hàng đã xóa thành công')
  async restore(@Param('id') _id: string, @User() user: IUser) {
    return await this.restaurantsService.restore({ _id }, user)
  }

  @Delete('/:id')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Xóa nhà hàng thành công')
  async remove(@Param('id') _id: string, @User() user: IUser) {
    return await this.restaurantsService.remove({ _id }, user)
  }
  @Get('/:id')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Lấy thông tin nhà hàng theo id thành công')
  async findOne(@Param('id') _id: string) {
    return await this.restaurantsService.findOne({ _id })
  }
}
