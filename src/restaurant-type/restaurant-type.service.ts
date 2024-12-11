import { Injectable } from '@nestjs/common'
import { RestaurantTypeRepository } from './model/restaurant.repo'
import { CreateRestaurantTypeDto } from './dto/create-restaurant-type.dto'
import { ConflictError } from 'src/utils/errorResponse'
import { RestaurantTypeDocument } from './model/restauran-type.model'

@Injectable()
export class RestaurantTypeService {
  constructor(private readonly restaurantTypeRepository: RestaurantTypeRepository) {}
  async create(createRestaurantTypeDto: CreateRestaurantTypeDto): Promise<RestaurantTypeDocument> {
    const { restaurant_type_name } = createRestaurantTypeDto
    const TypeExist = await this.restaurantTypeRepository.getRestaurantTypelByName({ restaurant_type_name })
    if (TypeExist) throw new ConflictError('Loại hình nhà hàng đã tồn tại')
    return await this.restaurantTypeRepository.create({ restaurant_type_name })
  }

  async findAll(): Promise<RestaurantTypeDocument[]> {
    return await this.restaurantTypeRepository.findAll()
  }

  async getRestaurantTypeByName({
    restaurant_type_name
  }: {
    restaurant_type_name: string
  }): Promise<RestaurantTypeDocument[]> {
    return await this.restaurantTypeRepository.getRestaurantTypeByNameInfor({ restaurant_type_name })
  }
}
