import { IsIn, IsMongoId, IsNotEmpty } from 'class-validator'

export class UpdateStatusTableDto {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsIn(['enable', 'disable'], { message: 'Status phải là "enable", "disable"' })
  tbl_status: string
}
