import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { OrderDish, OrderDishDocument } from './order-dish.model'
import { Model } from 'mongoose'
import { DishDuplicate, DishDuplicateDocument } from './dish-duplicate.model'
import { IGuest } from 'src/guest-restaurant/guest.interface'

@Injectable()
export class OrderDishRepository {
  constructor(
    @InjectModel(OrderDish.name) private orderDishModel: Model<OrderDishDocument>,
    @InjectModel(DishDuplicate.name) private dishDuplicateModel: Model<DishDuplicateDocument>
  ) {}

  async bulkCreateDishDuplicate(dishes: any[], options?: any) {
    return await this.dishDuplicateModel.insertMany(dishes, options)
  }

  async bulkCreateOrderDish(orders: any[], options?: any) {
    return await this.orderDishModel.insertMany(orders, options)
  }

  async listOrderGuest(guest: IGuest) {
    return await this.orderDishModel
      .find({
        od_dish_guest_id: guest._id,
        od_dish_table_id: guest.guest_table_id,
        od_dish_restaurant_id: guest.guest_restaurant_id
      })
      .populate('od_dish_duplicate_id')
      .lean()
  }
}
