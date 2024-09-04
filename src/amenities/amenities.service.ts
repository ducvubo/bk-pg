import { Injectable } from '@nestjs/common'
import { ConflictError } from 'src/utils/errorResponse'
import { AmenityRepository } from './model/amenities.repo'
import { CreateAmenityDto } from './dto/create-amenity.dto'

@Injectable()
export class AmenitiesService {
  constructor(private readonly amenityRepository: AmenityRepository) {}
  async create(createAmenityDto: CreateAmenityDto) {
    const { amenity_name } = createAmenityDto
    const TypeExist = await this.amenityRepository.getAmenitylByName({ amenity_name })
    if (TypeExist) throw new ConflictError('Loại hình nhà hàng đã tồn tại')
    return await this.amenityRepository.create({ amenity_name })
  }

  async findAll() {
    return await this.amenityRepository.findAll()
  }

  async getRestaurantTypeByName({ amenity_name }: { amenity_name: string }) {
    return await this.amenityRepository.getAmenityByNameInfor({ amenity_name })
  }
}
