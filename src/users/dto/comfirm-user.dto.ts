import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class ComfirmUserDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  us_email: string

  //otp
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString({ message: 'Mã OTP phải là chu��i' })
  otp: string
}
