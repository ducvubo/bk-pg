import { IsNotEmpty, IsString } from 'class-validator'

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'refresh_token không được để trống' })
  @IsString({ message: 'refresh_token phải là chuỗi' })
  guest_refresh_token: string
}
