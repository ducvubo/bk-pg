import { IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator'

export class UpdateVerify {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id không hợp lệ' })
  _id: string

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsBoolean({ message: 'Trạng thái phải là true hoặc false' })
  status: boolean
}
