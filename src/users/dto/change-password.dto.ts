import { OmitType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Vui lòng gửi lên email' })
  @IsString({ message: 'Email phải là dạng chuỗi' })
  us_email: string

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu mới' })
  @IsString({ message: 'Mật khẩu phải là dạng chuỗi' })
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

  @IsNotEmpty({ message: 'Vui lòng nhập mã OTP' })
  @IsString({ message: 'Mã OTP phải là dạng chuỗi' })
  otp: string
}

export class ForgotPasswordDto extends OmitType(ChangePasswordDto, ['us_password', 'otp'] as const) {}
