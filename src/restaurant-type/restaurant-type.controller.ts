import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { RestaurantTypeService } from './restaurant-type.service'
import { ResponseMessage } from 'src/decorator/customize'
import { CreateRestaurantTypeDto } from './dto/create-restaurant-type.dto'
import { RestaurantTypeDocument } from './model/restauran-type.model'

@Controller('restaurant-type')
export class RestaurantTypeController {
  constructor(private readonly restaurantTypeService: RestaurantTypeService) {}

  @Post()
  @ResponseMessage('Tạo loại hình nhà hàng thành công')
  async create(@Body() createRestaurantTypeDto: CreateRestaurantTypeDto): Promise<RestaurantTypeDocument> {
    return this.restaurantTypeService.create(createRestaurantTypeDto)
  }

  @Get()
  @ResponseMessage('Lấy tất cả loại hình nhà hàng thành công')
  async findAll(): Promise<RestaurantTypeDocument[]> {
    return await this.restaurantTypeService.findAll()
  }

  @Get('/search')
  @ResponseMessage('Lấy thông tin loại hình nhà hàng theo tên')
  async getRestuarantTypeByName(@Query('tag_name') restaurant_type_name: string): Promise<RestaurantTypeDocument[]> {
    return await this.restaurantTypeService.getRestaurantTypeByName({ restaurant_type_name })
  }
}
