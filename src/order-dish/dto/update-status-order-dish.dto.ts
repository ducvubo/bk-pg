import { IsIn, IsMongoId, IsNotEmpty } from 'class-validator'

export class UpdateStatusOrderDishDto {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsIn(['processing', 'pending', 'paid', 'delivered', 'refuse'], {
    message: 'Status phải là "processing", "pending", "paid", "delivered", "refuse" '
  })
  od_dish_status: string
}
