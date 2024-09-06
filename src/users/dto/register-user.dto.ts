import { IsEmail, IsNotEmpty } from 'class-validator'

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  us_email: string
}
