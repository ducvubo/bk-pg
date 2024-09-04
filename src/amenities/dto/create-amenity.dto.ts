import { IsNotEmpty, IsString } from 'class-validator'

export class CreateAmenityDto {
  @IsNotEmpty({ message: 'Tên loại nhà hàng không được để trống' })
  @IsString({ message: 'Tên loại nhà hàng phải là chuỗi' })
  amenity_name: string
}
