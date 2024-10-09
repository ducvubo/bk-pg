import { PartialType } from '@nestjs/mapped-types'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { CreateBlogDto } from './create-blog.dto'

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string
}
