import { OmitType } from '@nestjs/mapped-types'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { CreateEmployeeDto } from './create-employee.dto'

export class UpdateEmployeeDto extends OmitType(CreateEmployeeDto, ['epl_password'] as const) {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string
}
