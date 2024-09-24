import { Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ImageUrl } from 'src/restaurants/dto/create-restaurant.dto'

export class Sale {
  @IsNotEmpty({ message: 'Loại sale không được để trống' })
  @IsString({ message: 'Loại sale phải là một chuỗi' })
  @IsIn(['percentage', 'fixed'], { message: 'Loại sale phải là "percentage" hoặc "fixed"' })
  sale_type: 'percentage' | 'fixed'

  @IsNotEmpty({ message: 'Giá trị sale không được để trống' })
  @IsNumber({}, { message: 'Giá trị sale phải là một số' })
  sale_value: number
}

export class CreateDishDto {
  //tên
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString({ message: 'Tên phải là một chuỗi' })
  dish_name: string

  //ảnh
  @IsNotEmpty({ message: 'Ảnh món ăn không được để trống1' })
  @ValidateNested()
  @Type(() => ImageUrl)
  dish_image: ImageUrl

  //giá
  @IsNotEmpty({ message: 'Giá không được để trống' })
  @IsNumber({}, { message: 'Giá phải là một số' })
  dish_price: number

  //giới thiệu ngắn
  @IsNotEmpty({ message: 'Giới thiệu ngắn không được để trống' })
  @IsString({ message: 'Giới thiệu ngắn phải là một chuỗi' })
  dish_short_description: string

  //sale
  @ValidateNested()
  @Type(() => Sale)
  @IsOptional()
  dish_sale: Sale

  //sự ưu tiên
  @IsOptional()
  @IsNumber({}, { message: 'Sự ưu tiên phải là một số' })
  dish_priority: number

  //mô tả
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString({ message: 'Mô tả phải là một chuỗi' })
  dish_description: string

  //ghi chú
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là một chuỗi' })
  dish_note: string
}
