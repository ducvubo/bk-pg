import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { OrderDishSummaryRepository } from './model/order-dish-summary.repo'
import { BadRequestError } from 'src/utils/errorResponse'
import aqp from 'api-query-params'
import { IAccount } from 'src/accounts/accounts.interface'
import { OrderDishService } from 'src/order-dish/order-dish.service'
import { UpdateStatusOrderSummaryDto } from './dto/update-status-summary.dto'
import { TableRepository } from 'src/tables/model/tables.repo'
import { GuestRestaurantRepository } from 'src/guest-restaurant/model/guest-restaurant.repo'
import { deleteCacheIO } from 'src/utils/cache'
import { KEY_ACCESS_TOKEN_GUEST_RESTAURANT } from 'src/constants/key.redis'
import { SocketGateway } from 'src/socket/socket.gateway'
import mongoose from 'mongoose'

@Injectable()
export class OrderDishSummaryService {
  constructor(
    private readonly orderDishSummaryRepository: OrderDishSummaryRepository,
    @Inject(forwardRef(() => OrderDishService))
    private readonly orderDishService: OrderDishService,
    @Inject(forwardRef(() => GuestRestaurantRepository))
    private readonly guestRestaurantRepository: GuestRestaurantRepository,
    private readonly tableRepository: TableRepository,
    private readonly socketGateway: SocketGateway
  ) {}

  async listOrderRestaurant(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ) {
    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 8 : limit

    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }

    const { filter, sort } = aqp(qs)

    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10

    // Kiểm tra và xoá các trường nếu không có giá trị hợp lệ
    if (!filter.guest_name || typeof filter.guest_name !== 'string') {
      delete filter.guest_name
    }

    if (!filter.tbl_name || typeof filter.tbl_name !== 'string') {
      delete filter.tbl_name
    }

    //'processing' | 'pending' | 'paid' | 'delivered' | 'refuse'
    const validStatuses = ['paid', 'ordering', 'refuse']

    if (!validStatuses.includes(filter.od_dish_smr_status)) {
      delete filter.od_dish_smr_status
    }

    const item = await this.orderDishSummaryRepository.totalItemsListOrderRestaurant(filter, account)
    const totalPages = Math.ceil(item.totalItems / defaultLimit)

    const result = await this.orderDishSummaryRepository.findPaginationListOrderRestaurant(
      {
        offset,
        defaultLimit,
        sort,
        filter
      },
      account
    )

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        totalPage: totalPages,
        totalItem: item.totalItems,
        statusCount: item.statusCounts
      },
      result
    }
  }

  async updateStatusOrderDishSummay(updateStatusOrderSummaryDto: UpdateStatusOrderSummaryDto, account: IAccount) {
    const { _id } = updateStatusOrderSummaryDto
    const order = await this.orderDishSummaryRepository.findOneById({ _id })
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại, vui lòng thử lại sau ít phút')
    if (order.od_dish_smr_status === 'paid')
      throw new BadRequestError('Đơn hàng đã được thanh toán, không thể cập nhật')
    if (order.od_dish_smr_status === 'refuse') throw new BadRequestError('Đơn hàng đã bị từ chối, không thể cập nhật')
    const update = this.orderDishSummaryRepository.updateStatusOrderDishSummary(updateStatusOrderSummaryDto, account)
    if (!update) throw new BadRequestError('Cập nhật trạng thái đơn hàng thất bại, vui lòng thử lại sau ít phút')
    this.socketGateway.server.emit('update_order_dish_summary', {
      od_dish_smr_status: updateStatusOrderSummaryDto.od_dish_smr_status
    })
    const logout = await this.guestRestaurantRepository.logOutTable({
      guest_table_id: String(order.od_dish_smr_table_id)
    })
    logout?.map(async (_id) => {
      await deleteCacheIO(`${KEY_ACCESS_TOKEN_GUEST_RESTAURANT}:${_id}`)
    })
    await this.tableRepository.updateStatus({ _id: String(order.od_dish_smr_table_id), tbl_status: 'enable' }, account)
    return update
  }

  async listOrdering(account: IAccount) {
    return await this.orderDishSummaryRepository.listOrdering(account)
  }

  async createOrderDishSummary(od_dish_smr_table_id: string, account: IAccount) {
    if (!od_dish_smr_table_id) throw new BadRequestError('Bàn không tồn tại, vui lòng thử lại sau ít phút')
    if (mongoose.Types.ObjectId.isValid(od_dish_smr_table_id) === false)
      throw new BadRequestError('Bàn không tồn tại, vui lòng thử lại sau ít phút')
    const table = await this.tableRepository.findOneById({ _id: od_dish_smr_table_id })
    if (!table) throw new BadRequestError('Bàn không tồn tại, vui lòng thử lại sau ít phút')
    if (table.tbl_status === 'disable') throw new BadRequestError('Bàn không tồn tại, vui lòng thử lại sau ít phút')
    if (table.tbl_status === 'serving') throw new BadRequestError('Bàn đã được đặt trước, vui lòng thử lại sau ít phút')
    if (table.tbl_status === 'reserve') throw new BadRequestError('Bàn đang phục vụ, vui lòng thử lại sau ít phút')

    const newGuest = await this.guestRestaurantRepository.createGuestRestaurant({
      guest_restaurant_id: account.account_restaurant_id,
      guest_table_id: od_dish_smr_table_id,
      createdBy: {
        _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
        email: account.account_email
      }
    })

    const order = await this.orderDishSummaryRepository.restaurantCreayeOrderDishSummary({
      od_dish_smr_restaurant_id: account.account_restaurant_id,
      od_dish_smr_guest_id: String(newGuest._id),
      od_dish_smr_table_id,
      createdBy: {
        _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
        email: account.account_email
      }
    })

    await this.tableRepository.updateStatus({ _id: od_dish_smr_table_id, tbl_status: 'reserve' }, account)
    return order
  }

  async listOrderSummaryByTable(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    od_dish_smr_table_id: string,
    account: IAccount
  ) {
    if (!od_dish_smr_table_id || typeof od_dish_smr_table_id !== 'string') {
      throw new BadRequestError('Bàn không tồn tại, vui lòng thử lại sau ít phút')
    }
    if (!od_dish_smr_table_id) throw new BadRequestError('Bàn không tồn tại, vui lòng thử lại sau ít phút')
    if (mongoose.Types.ObjectId.isValid(od_dish_smr_table_id) === false)
      throw new BadRequestError('Bàn không tồn tại, vui lòng thử lại sau ít phút')

    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 8 : limit

    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }

    const { filter, sort } = aqp(qs)

    delete filter.od_dish_smr_table_id
    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10
    filter.od_dish_smr_table_id = od_dish_smr_table_id

    const totalItems = await this.orderDishSummaryRepository.totalItemsListOrderSummary(filter, account)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.orderDishSummaryRepository.findPaginationListOrderSummary(
      {
        offset,
        defaultLimit,
        sort,
        filter
      },
      account
    )

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        totalPage: totalPages,
        totalItem: totalItems
      },
      result
    }
  }
}
