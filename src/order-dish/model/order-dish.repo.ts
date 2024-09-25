import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { OrderDish, OrderDishDocument } from './order-dish.model'
import { Model } from 'mongoose'
import { DishDuplicate, DishDuplicateDocument } from './dish-duplicate.model'

@Injectable()
export class OrderDishRepository {
  constructor(
    @InjectModel(OrderDish.name) private orderDishModel: Model<OrderDishDocument>,
    @InjectModel(DishDuplicate.name) private dishDuplicateModel: Model<DishDuplicateDocument>
  ) {}

  // async bulkCreateDishDuplicate(data: any) {
  //   return await this.dishDuplicateModel.insertMany(data)
  // }

  // async bulkCreateOrderDish(data: any) {
  //   return await this.orderDishModel.insertMany(data)
  // }

  async bulkCreateDishDuplicate(dishes: any[], options?: any) {
    return await this.dishDuplicateModel.insertMany(dishes, options)
  }

  async bulkCreateOrderDish(orders: any[], options?: any) {
    return await this.orderDishModel.insertMany(orders, options)
  }
}
