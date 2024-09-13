import { IsIn, IsMongoId, IsNotEmpty, IsString } from 'class-validator'

export class UpdateStatusUser {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id không hợp lệ' })
  _id: string

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsString({ message: 'Trạng thái phải là chuỗi' })
  @IsIn(['enable', 'disable'], { message: 'Trạng thái chỉ có thể là "enable" hoặc "disable"' })
  status: 'enable' | 'disable'
}
