import { IsNotEmpty, IsString } from 'class-validator'

export class AddMemberDto {
  //token
  @IsNotEmpty({ message: 'Token không được để trống' })
  @IsString({ message: 'Token không hợp lệ' })
  token: string

  //tên
  @IsNotEmpty({ message: 'Vui lòng nhập tên' })
  @IsString({ message: 'Tên không hợp lệ' })
  guest_name: string
}
