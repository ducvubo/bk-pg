import { OmitType } from '@nestjs/mapped-types'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { CreateRestaurantDto } from './create-restaurant.dto' // Đường dẫn đến CreateRestaurantDto

export class UpdateRestaurantDto extends OmitType(CreateRestaurantDto, ['restaurant_password'] as const) {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string
}
