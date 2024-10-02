import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { OrderDishSummary, OrderDishSummaryDocument } from './order-dish-summary.model'
import { GuestRestaurantRepository } from 'src/guest-restaurant/model/guest-restaurant.repo'
import { TableRepository } from 'src/tables/model/tables.repo'
import { IAccount } from 'src/accounts/accounts.interface'
import { OrderDishRepository } from 'src/order-dish/model/order-dish.repo'
import { UpdateStatusOrderSummaryDto } from '../dto/update-status-summary.dto'

@Injectable()
export class OrderDishSummaryRepository {
  constructor(
    @InjectModel(OrderDishSummary.name) private orderDishSumaryModel: Model<OrderDishSummaryDocument>,
    @Inject(forwardRef(() => GuestRestaurantRepository))
    private readonly guestRestaurantRepository: GuestRestaurantRepository,
    @Inject(forwardRef(() => OrderDishRepository))
    private readonly orderDishRepository: OrderDishRepository,
    private readonly tableRepository: TableRepository
  ) {}

  async createOrderDishSummary({
    od_dish_smr_restaurant_id,
    od_dish_smr_guest_id,
    od_dish_smr_table_id
  }: {
    od_dish_smr_restaurant_id: string
    od_dish_smr_guest_id: string
    od_dish_smr_table_id: string
  }) {
    return this.orderDishSumaryModel.create({
      od_dish_smr_restaurant_id,
      od_dish_smr_guest_id,
      od_dish_smr_table_id,
      od_dish_smr_status: 'ordering'
    })
  }

  async findOneByGuestId({ od_dish_smr_guest_id }: { od_dish_smr_guest_id: string }) {
    return this.orderDishSumaryModel.findOne({ od_dish_smr_guest_id })
  }

  async findOneById({ _id }: { _id: string }) {
    return this.orderDishSumaryModel.findOne({ _id }).populate('od_dish_smr_guest_id').lean()
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
      cloneFilter.od_dish_smr_guest_id = { $in: guestIds } // Thêm điều kiện lọc cho od_dish_guest_id
      delete cloneFilter.guest_name // Xóa guest_name khỏi filter để không bị lỗi
    }

    if (filter.tbl_name) {
      const table = await this.tableRepository.findByName({ tbl_name: cloneFilter.tbl_name }) // Tìm kiếm guest theo tên
      const tableId = table.map((table) => table._id) // Lấy danh sách ID của các guest
      cloneFilter.od_dish_smr_table_id = { $in: tableId } // Thêm điều kiện lọc cho od_dish_guest_id
      delete cloneFilter.tbl_name // Xóa guest_name khỏi filter để không bị lỗi
    }

    const statusList = ['paid', 'ordering', 'refuse'] // Danh sách các trạng thái
    const result = await this.orderDishSumaryModel.aggregate([
      {
        $match: {
          isDeleted: false,
          od_dish_smr_restaurant_id: account.account_restaurant_id,
          createdAt: {
            $gte: toDate,
            $lte: fromDate
          },
          ...cloneFilter
        }
      },
      {
        $group: {
          _id: '$od_dish_smr_status', // Nhóm theo trạng thái
          count: { $sum: 1 } // Đếm số lượng mỗi trạng thái
        }
      }
    ])

    // Tính tổng số lượng item
    const totalItems = await this.orderDishSumaryModel
      .countDocuments({
        isDeleted: false,
        od_dish_smr_restaurant_id: account.account_restaurant_id,
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
      filter.od_dish_smr_guest_id = { $in: guestIds } // Thêm điều kiện lọc cho od_dish_guest_id
      delete filter.guest_name // Xóa guest_name khỏi filter để không bị lỗi
    }

    if (filter.tbl_name) {
      const table = await this.tableRepository.findByName({ tbl_name: filter.tbl_name }) // Tìm kiếm guest theo tên
      const tableId = table.map((table) => table._id) // Lấy danh sách ID của các guest
      filter.od_dish_smr_table_id = { $in: tableId } // Thêm điều kiện lọc cho od_dish_guest_id
      delete filter.tbl_name // Xóa guest_name khỏi filter để không bị lỗi
    }

    const orderDishSummary = await this.orderDishSumaryModel
      .find({
        isDeleted: false,
        od_dish_smr_restaurant_id: account.account_restaurant_id,
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
      .populate({
        path: 'od_dish_smr_guest_id',
        select: 'guest_name _id guest_type'
      })
      .populate({
        path: 'od_dish_smr_table_id',
        select: 'tbl_name _id'
      })
      .exec()

    const orderDishSummaryIds: any = orderDishSummary.map((summary) => summary._id)

    // Truy vấn các món ăn dựa trên danh sách ID
    const listOrder = await this.orderDishRepository.findListOrderByListIdOrderSummary(orderDishSummaryIds)

    // Ánh xạ dữ liệu để thêm chi tiết món ăn vào orderDishSummary
    const orderSummariesWithDishes = orderDishSummary.map((summary) => {
      const dishes = listOrder.filter((dish) => dish.od_dish_summary_id.toString() === summary._id.toString())
      return {
        ...summary.toObject(), // chuyển đổi từ MongoDB document sang plain object nếu cần
        or_dish: dishes // ghi đè lại trường or_dish bằng dữ liệu chi tiết
      }
    })

    return orderSummariesWithDishes
  }

  async updateStatusOrderDishSummary(updateStatusOrderSummaryDto: UpdateStatusOrderSummaryDto, account: IAccount) {
    const { _id, od_dish_smr_status } = updateStatusOrderSummaryDto
    return this.orderDishSumaryModel.findOneAndUpdate(
      { _id, od_dish_smr_restaurant_id: account.account_restaurant_id },
      {
        od_dish_smr_status,
        updatedBy: {
          _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },
      { new: true }
    )
  }

  async findTableStatusOrderById({
    od_dish_smr_table_id,
    od_dish_smr_status
  }: {
    od_dish_smr_table_id: string
    od_dish_smr_status: 'paid' | 'refuse' | 'ordering'
  }) {
    return this.orderDishSumaryModel.find({ od_dish_smr_table_id, od_dish_smr_status })
  }

  async listOrdering(account: IAccount) {
    return this.orderDishSumaryModel
      .find({
        od_dish_smr_restaurant_id: account.account_restaurant_id,
        od_dish_smr_status: 'ordering'
      })
      .populate('od_dish_smr_guest_id')
      .populate('od_dish_smr_table_id')
      .lean()
  }

  async restaurantCreayeOrderDishSummary({
    od_dish_smr_restaurant_id,
    od_dish_smr_guest_id,
    od_dish_smr_table_id,
    createdBy
  }: {
    od_dish_smr_guest_id: string
    od_dish_smr_restaurant_id: string
    od_dish_smr_table_id: string
    createdBy: {
      _id: string
      email: string
    }
  }) {
    return this.orderDishSumaryModel.create({
      od_dish_smr_restaurant_id,
      od_dish_smr_guest_id,
      od_dish_smr_table_id,
      od_dish_smr_status: 'ordering',
      createdBy
    })
  }
}
