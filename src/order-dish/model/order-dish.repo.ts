import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { OrderDish, OrderDishDocument } from './order-dish.model'
import { Model } from 'mongoose'
import { DishDuplicate, DishDuplicateDocument } from './dish-duplicate.model'
import { IAccount } from 'src/accounts/accounts.interface'
import { GuestRestaurantRepository } from 'src/guest-restaurant/model/guest-restaurant.repo'
import { TableRepository } from 'src/tables/model/tables.repo'
import { UpdateStatusOrderDishDto } from '../dto/update-status-order-dish.dto'

@Injectable()
export class OrderDishRepository {
  constructor(
    @InjectModel(OrderDish.name) private orderDishModel: Model<OrderDishDocument>,
    @InjectModel(DishDuplicate.name) private dishDuplicateModel: Model<DishDuplicateDocument>,
    private readonly guestRestaurantRepository: GuestRestaurantRepository,
    private readonly tableRepository: TableRepository
  ) {}

  async bulkCreateDishDuplicate(dishes: any[], options?: any) {
    return await this.dishDuplicateModel.insertMany(dishes, options)
  }

  async bulkCreateOrderDish(orders: any[], options?: any) {
    return await this.orderDishModel.insertMany(orders, options)
  }

  async listOrderGuest(guestArray: { _id: string; guest_table_id: string; guest_restaurant_id: string }[]) {
    return await this.orderDishModel
      .find({
        od_dish_guest_id: { $in: guestArray.map((guest) => guest._id) }, // Tìm theo danh sách các _id trong guestArray
        od_dish_table_id: guestArray[0].guest_table_id, // Giữ nguyên guest_table_id từ phần tử đầu tiên
        od_dish_restaurant_id: guestArray[0].guest_restaurant_id // Giữ nguyên guest_restaurant_id từ phần tử đầu tiên
      })
      .populate('od_dish_duplicate_id')
      .lean()
  }

  async totalItemsListOrderRestaurant(filter, account: IAccount) {
    const toDate = new Date(filter.toDate) // Chuyển đổi thành Date
    const fromDate = new Date(filter.fromDate)
    const cloneFilter = { ...filter }
    delete cloneFilter.toDate
    delete cloneFilter.fromDate
    if (filter.guest_name) {
      const guestRestaurants = await this.guestRestaurantRepository.findByName({ guest_name: cloneFilter.guest_name }) // Tìm kiếm guest theo tên
      const guestIds = guestRestaurants.map((guest) => guest._id) // Lấy danh sách ID của các guest
      cloneFilter.od_dish_guest_id = { $in: guestIds } // Thêm điều kiện lọc cho od_dish_guest_id
      delete cloneFilter.guest_name // Xóa guest_name khỏi filter để không bị lỗi
    }

    if (filter.tbl_name) {
      const table = await this.tableRepository.findByName({ tbl_name: cloneFilter.tbl_name }) // Tìm kiếm guest theo tên
      const tableId = table.map((table) => table._id) // Lấy danh sách ID của các guest
      cloneFilter.od_dish_table_id = { $in: tableId } // Thêm điều kiện lọc cho od_dish_guest_id
      delete cloneFilter.tbl_name // Xóa guest_name khỏi filter để không bị lỗi
    }

    const statusList = ['processing', 'pending', 'paid', 'delivered', 'refuse'] // Danh sách các trạng thái
    const result = await this.orderDishModel.aggregate([
      {
        $match: {
          isDeleted: false,
          od_dish_restaurant_id: account.account_restaurant_id,
          createdAt: {
            $gte: toDate,
            $lte: fromDate
          },
          ...cloneFilter
        }
      },
      {
        $group: {
          _id: '$od_dish_status', // Nhóm theo trạng thái
          count: { $sum: 1 } // Đếm số lượng mỗi trạng thái
        }
      }
    ])

    // Tính tổng số lượng item
    const totalItems = await this.orderDishModel
      .countDocuments({
        isDeleted: false,
        od_dish_restaurant_id: account.account_restaurant_id,
        createdAt: {
          $gte: toDate,
          $lte: fromDate
        },
        ...cloneFilter
      })
      .lean()

    // Chuyển đổi kết quả thành một đối tượng với trạng thái là key
    const statusCountsMap = result.reduce((acc, curr) => {
      acc[curr._id] = curr.count
      return acc
    }, {})

    // Tạo một đối tượng kết quả với tất cả các trạng thái và gán giá trị 0 nếu không có
    const statusCounts = statusList.map((status) => ({
      status,
      count: statusCountsMap[status] || 0 // Gán giá trị 0 nếu không có
    }))

    return {
      totalItems, // Tổng số item
      statusCounts // Số lượng mỗi trạng thái
    }
  }

  async findPaginationListOrderRestaurant({ offset, defaultLimit, sort, filter }, account: IAccount) {
    const toDate = new Date(filter.toDate) // Chuyển đổi thành Date
    const fromDate = new Date(filter.fromDate)
    delete filter.toDate
    delete filter.fromDate
    if (filter.guest_name) {
      const guestRestaurants = await this.guestRestaurantRepository.findByName({ guest_name: filter.guest_name }) // Tìm kiếm guest theo tên
      const guestIds = guestRestaurants.map((guest) => guest._id) // Lấy danh sách ID của các guest
      filter.od_dish_guest_id = { $in: guestIds } // Thêm điều kiện lọc cho od_dish_guest_id
      delete filter.guest_name // Xóa guest_name khỏi filter để không bị lỗi
    }

    if (filter.tbl_name) {
      const table = await this.tableRepository.findByName({ tbl_name: filter.tbl_name }) // Tìm kiếm guest theo tên
      const tableId = table.map((table) => table._id) // Lấy danh sách ID của các guest
      filter.od_dish_table_id = { $in: tableId } // Thêm điều kiện lọc cho od_dish_guest_id
      delete filter.tbl_name // Xóa guest_name khỏi filter để không bị lỗi
    }

    return this.orderDishModel
      .find({
        isDeleted: false,
        od_dish_restaurant_id: account.account_restaurant_id,
        createdAt: {
          $gte: toDate,
          $lte: fromDate
        },
        ...filter
      })
      .select(' -__v')
      .skip(offset)
      .limit(defaultLimit)
      .sort({ updatedAt: -1, ...sort })
      .populate('od_dish_guest_id')
      .populate('od_dish_table_id')
      .populate('od_dish_duplicate_id')
      .exec()
  }

  async findOneById({ _id, account }: { _id: string; account: IAccount }) {
    return this.orderDishModel.findOne({ _id, od_dish_restaurant_id: account.account_restaurant_id }).lean()
  }
  async updateStatusOrderDish(updateStatusOrderDishDto: UpdateStatusOrderDishDto, account: IAccount) {
    const { _id, od_dish_status } = updateStatusOrderDishDto
    return this.orderDishModel.findOneAndUpdate(
      { _id, od_dish_restaurant_id: account.account_restaurant_id },
      { od_dish_status: od_dish_status },
      { new: true }
    )
  }
}
