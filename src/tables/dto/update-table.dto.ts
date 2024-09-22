import { PartialType } from '@nestjs/mapped-types'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { CreateTableDto } from './create-table.dto'

export class UpdateTableDto extends PartialType(CreateTableDto) {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string
}
