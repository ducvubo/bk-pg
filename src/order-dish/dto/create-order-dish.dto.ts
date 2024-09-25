import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateOrderDishDto {
  @IsNotEmpty({ message: 'Id món ăn không được để trống' })
  @IsString({ message: 'Id món ăn phải là chuỗi' })
  od_dish_id: string

  @IsNotEmpty({ message: 'Số lượng món ăn không được để trống' })
  @IsNumber({}, { message: 'Số lượng món ăn phải là số' })
  od_dish_quantity: number
}
