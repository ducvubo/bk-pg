import { IsNotEmpty, IsString } from 'class-validator'

export class LoginGuestRestaurantDto {
  @IsNotEmpty({ message: 'Không tìm thấy nhà hàng' })
  @IsString({ message: 'Nhà hàng không hợp lệ' })
  guest_restaurant_id: string

  @IsNotEmpty({ message: 'Không tìm thấy bàn' })
  @IsString({ message: 'Bàn không hợp lệ' })
  guest_table_id: string

  @IsNotEmpty({ message: 'Vui lòng nhập tên' })
  @IsString({ message: 'Tên không hợp lệ' })
  guest_name: string
}
