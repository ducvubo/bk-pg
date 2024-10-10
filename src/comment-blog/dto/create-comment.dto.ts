import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ImageUrl } from 'src/restaurants/dto/create-restaurant.dto'

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Blog id không được để trống' })
  @IsMongoId({ message: 'Blog id không hợp lệ' })
  cmt_blg_blog_id: string

  @ValidateNested()
  @Type(() => ImageUrl)
  @IsOptional()
  cmt_blg_image: ImageUrl[]

  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsString({ message: 'Nội dung phải là chuỗi' })
  cmt_blg_content: string

  @IsMongoId({ message: 'Parent id không hợp lệ' })
  @IsOptional()
  cmt_blg_parentId?: string
}
