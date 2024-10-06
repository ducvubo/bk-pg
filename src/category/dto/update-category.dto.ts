import { PartialType } from '@nestjs/mapped-types'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { CreateCategoryDto } from './create-category.dto'

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string
}
