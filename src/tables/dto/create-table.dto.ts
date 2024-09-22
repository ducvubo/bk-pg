import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'

export class CreateTableDto {
  @IsNotEmpty({ message: 'Tên bàn không được để trống' })
  @IsString({ message: 'Tên bàn phải là một chuỗi' })
  tbl_name: string

  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString({ message: 'Mô tả phải là một chuỗi' })
  tbl_description: string

  @IsNotEmpty({ message: 'Số lượng người 1 bàn không được để trống' })
  @IsNumber({}, { message: 'Số lượng người 1 bàn phải là một số' })
  @Min(2, { message: 'Số lượng người 1 bàn phải lớn hơn hoặc bằng 2' })
  tbl_capacity: number
}
