import { IsIn, IsMongoId, IsNotEmpty, IsString } from 'class-validator'

export class UpdateStatus {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id không hợp lệ' })
  _id: string

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsString({ message: 'Trạng thái phải là chuỗi' })
  @IsIn(['active', 'inactive', 'banned'], { message: 'Trạng thái chỉ có thể là "active", "inactive" hoặc "deleted"' })
  status: 'active' | 'inactive' | 'banned'
}
