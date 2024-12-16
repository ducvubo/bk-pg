import { PartialType } from '@nestjs/mapped-types'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { CreateCategoryRestaurantDto } from './create-catgory-restaurant.dto'

export class UpdateCategoryRestaurantDto extends PartialType(CreateCategoryRestaurantDto) {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string
}
