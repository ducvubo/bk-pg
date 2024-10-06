import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ImageUrl } from 'src/restaurants/dto/create-restaurant.dto'

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  category_name: string

  @IsNotEmpty({ message: 'Ảnh danh mục không được để trống' })
  @ValidateNested()
  @Type(() => ImageUrl)
  category_image: ImageUrl

  //description
  @IsNotEmpty({ message: 'Mô tả danh mục không được để trống' })
  @IsString({ message: 'Mô tả danh mục phải là chuỗi' })
  category_description: string

  //parent_id
  @IsOptional()
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  category_parent_id: string
}
