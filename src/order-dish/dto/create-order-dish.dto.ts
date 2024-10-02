import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator'

export class CreateOrderDishDto {
  @IsNotEmpty({ message: 'Id món ăn không được để trống' })
  @IsString({ message: 'Id món ăn phải là chuỗi' })
  od_dish_id: string

  @IsNotEmpty({ message: 'Số lượng món ăn không được để trống' })
  @IsNumber({}, { message: 'Số lượng món ăn phải là số' })
  od_dish_quantity: number
}

export class RestaurantCreateOrderDishDto {
  @IsNotEmpty({ message: 'Id bàn không được để trống' })
  @IsString({ message: 'Id bàn phải là chuỗi' })
  od_dish_summary_id: string

  @IsNotEmpty({ message: 'Món ăn không được để trống' })
  @IsArray({ message: 'Món ăn phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDishDto)
  order_dish: CreateOrderDishDto[]
}
