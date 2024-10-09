import { Type } from 'class-transformer'
import { ArrayUnique, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ImageUrl } from 'src/restaurants/dto/create-restaurant.dto'

export class CreateBlogDto {
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  blg_title: string

  @IsNotEmpty({ message: 'Ảnh thumbnail không được để trống' })
  @ValidateNested()
  @Type(() => ImageUrl)
  blg_thumbnail: ImageUrl

  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsString({ message: 'Nội dung phải là chuỗi' })
  blg_content: string

  @IsOptional()
  @IsArray({ message: 'Tag phải là mảng' })
  @ArrayUnique({ message: 'Tag phải là duy nhất' })
  @IsString({ each: true, message: 'Mỗi tag phải là chuỗi' })
  blg_tag: string[]
}
