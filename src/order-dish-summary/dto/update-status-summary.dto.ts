import { IsIn, IsMongoId, IsNotEmpty } from 'class-validator'

export class UpdateStatusOrderSummaryDto {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsIn(['paid', 'refuse'], {
    message: 'Status phải là "paid", "refuse"'
  })
  od_dish_smr_status: 'paid' | 'refuse'
}
