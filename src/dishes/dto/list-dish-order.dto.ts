import { IsMongoId, IsNotEmpty } from 'class-validator'

export class ListDishOrderDto {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  dish_restaurant_id: string
}
