import { IsIn, IsMongoId, IsNotEmpty, IsString } from 'class-validator'

export class UpdateStatusBookTableDto {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id không đúng định dạng' })
  _id: string

  @IsString({ message: 'Trạng thái không đúng định dạng' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsIn(['Nhà hàng đã tiếp nhận', 'Đã hoàn thành', 'Hủy'], {
    message: 'Status phải là "Nhà hàng đã tiếp nhận", "Đã hoàn thành", "Hủy"'
  })
  book_tb_status: 'Nhà hàng đã tiếp nhận' | 'Đã hoàn thành' | 'Hủy'
}
