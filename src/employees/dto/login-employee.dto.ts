import { IsEmail, IsMongoId, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

export class LoginEmployeeDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsString({ message: 'Email phải là chuỗi' })
  epl_email: string

  @IsNotEmpty({ message: 'Mật khẩu nhà hàng không được để trống' })
  @IsString({ message: 'Mật khẩu nhà hàng phải là chuuỗi' })
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
  epl_password: string

  @IsNotEmpty({ message: 'Nhà hàng không được để trống' })
  @IsMongoId({ message: 'Nhà hàng phải là một ObjectId hợp lệ' })
  epl_restaurant_id: string
}
