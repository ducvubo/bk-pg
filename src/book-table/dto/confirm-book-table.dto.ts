import { IsNotEmpty, IsString } from 'class-validator'

export class ConfirmBookTableDto {
  @IsNotEmpty({ message: 'Token phải không trống' })
  @IsString({ message: 'Token phải là chuỗi' })
  book_tb_token_verify: string
}
