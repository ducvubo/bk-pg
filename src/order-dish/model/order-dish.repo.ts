import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { OrderDish, OrderDishDocument } from './order-dish.model'
import { Model } from 'mongoose'
import { DishDuplicate, DishDuplicateDocument } from './dish-duplicate.model'
import { UpdateStatusOrderDishDto } from '../dto/update-status-order-dish.dto'
import { IAccount } from 'src/accounts/accounts.interface'

@Injectable()
export class OrderDishRepository {
  constructor(
    @InjectModel(OrderDish.name) private orderDishModel: Model<OrderDishDocument>,
    @InjectModel(DishDuplicate.name) private dishDuplicateModel: Model<DishDuplicateDocument>
  ) {}

  // async bulkCreateDishDuplicate(dishes: any[], options?: any) {
  //   return await this.dishDuplicateModel.insertMany(dishes, options)
  // }

  // async bulkCreateOrderDish(orders: any[], options?: any) {
  //   return await this.orderDishModel.insertMany(orders, options)
  // }

  async bulkCreateDishDuplicate(dishes: any[]) {
    return await this.dishDuplicateModel.insertMany(dishes)
  }

  async bulkCreateOrderDish(orders: any[]) {
    return await this.orderDishModel.insertMany(orders)
  }

  async listOrderGuest({ od_dish_summary_id }: { od_dish_summary_id: string }) {
    return await this.orderDishModel
      .find({ od_dish_summary_id })
      .populate('od_dish_duplicate_id')
      .populate('od_dish_guest_id')
      .sort({ createdAt: -1 })
      .lean()
  }

  async findListOrderByListIdOrderSummary(listId: string[]) {
    return await this.orderDishModel
      .find({ od_dish_summary_id: { $in: listId } })
      .populate({
        path: 'od_dish_guest_id',
        select: 'guest_name _id guest_owner guest_type'
      })
      .populate({
        path: 'od_dish_duplicate_id',
        select: 'dish_duplicate_name _id dish_duplicate_image dish_duplicate_price dish_duplicate_sale'
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec()
  }

  async findOneById({ _id }: { _id: string }) {
    return this.orderDishModel.findOne({ _id }).lean()
  }
  async updateStatusOrderDish(updateStatusOrderDishDto: UpdateStatusOrderDishDto, account: IAccount) {
    const { _id, od_dish_status, od_dish_summary_id } = updateStatusOrderDishDto
    return this.orderDishModel.findOneAndUpdate(
      { _id, od_dish_summary_id: od_dish_summary_id },
      {
        od_dish_status: od_dish_status,
        updatedBy: {
          _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },
      { new: true }
    )
  }

  async findOneDishDuplicateById({ _id }: { _id: string }) {
    return this.dishDuplicateModel.findOne({ _id }).lean()
  }
}
