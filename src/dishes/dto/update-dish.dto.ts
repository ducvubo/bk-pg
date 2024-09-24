import { PartialType } from '@nestjs/mapped-types'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { CreateDishDto } from './create-dish.dto'

export class UpdateDishDto extends PartialType(CreateDishDto) {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string
}
