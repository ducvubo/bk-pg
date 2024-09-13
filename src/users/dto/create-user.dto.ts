import { Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsOptional, IsString, IsStrongPassword, ValidateNested } from 'class-validator'
import { ImageUrl } from 'src/restaurants/dto/create-restaurant.dto'

export class CreateUserDto {
  //email
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsString({ message: 'Email phải là chuỗi' })
  us_email: string

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuuỗi' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt, và dài ít nhất 8 ký tự'
    }
  )
  us_password: string

  @IsNotEmpty({ message: 'Vui lòng nhập tên' })
  @IsString({ message: 'Tên phải là chuỗi' })
  us_name: string

  @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ' })
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  us_address: string

  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  us_phone: string

  @IsNotEmpty({ message: 'Vui lòng chọn quyền' })
  @IsString({ message: 'Quyền phải là chuỗi' })
  us_role: string

  @IsNotEmpty({ message: 'Vui lòng chọn giới tính' })
  @IsString({ message: 'Giới tính phải là chuỗi' })
  @IsIn(['Khác', 'Nam', 'Nữ'], { message: 'Giới tính phải là "Khác", "Nam", hoặc "Nữ"' })
  us_gender: string

  @IsNotEmpty({ message: 'Ảnh banner không được để trống' })
  @ValidateNested()
  @Type(() => ImageUrl)
  @IsOptional()
  us_avatar?: ImageUrl
}
