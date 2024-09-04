import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { AmenitiesService } from './amenities.service'
import { ResponseMessage } from 'src/decorator/customize'
import { CreateAmenityDto } from './dto/create-amenity.dto'

@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}
  @Post()
  @ResponseMessage('Tạo tiện ích thành công')
  async create(@Body() createRestaurantTypeDto: CreateAmenityDto) {
    return this.amenitiesService.create(createRestaurantTypeDto)
  }

  @Get()
  @ResponseMessage('Lấy danh sách tất cả tiện ích')
  async findAll() {
    return await this.amenitiesService.findAll()
  }

  @Get('/search')
  @ResponseMessage('Lấy thông tin tiện ích theo tên')
  async getAmenityByName(@Query('tag_name') amenity_name: string) {
    return await this.amenitiesService.getRestaurantTypeByName({ amenity_name })
  }
}
