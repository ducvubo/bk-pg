import { Type } from 'class-transformer'
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { ImageUrl } from 'src/restaurants/dto/create-restaurant.dto'

export class CreateCategoryRestaurantDto {
  //tên
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString({ message: 'Tên phải là một chuỗi' })
  cat_res_name: string

  //ảnh
  @IsNotEmpty({ message: 'Ảnh món ăn không được để trống1' })
  @ValidateNested()
  @Type(() => ImageUrl)
  cat_res_icon: ImageUrl

  //giới thiệu ngắn
  @IsNotEmpty({ message: 'Giới thiệu ngắn không được để trống' })
  @IsString({ message: 'Giới thiệu ngắn phải là một chuỗi' })
  cat_res_short_description: string
}
