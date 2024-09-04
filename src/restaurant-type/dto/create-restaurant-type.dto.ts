import { IsNotEmpty, IsString } from 'class-validator'

export class CreateRestaurantTypeDto {
  @IsNotEmpty({ message: 'Tên loại nhà hàng không được để trống' })
  @IsString({ message: 'Tên loại nhà hàng phải là chuỗi' })
  restaurant_type_name: string
}
