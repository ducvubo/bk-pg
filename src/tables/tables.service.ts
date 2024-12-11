import { Injectable } from '@nestjs/common'
import { TableRepository } from './model/tables.repo'
import { CreateTableDto } from './dto/create-table.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { BadRequestError } from 'src/utils/errorResponse'
import aqp from 'api-query-params'
import { UpdateTableDto } from './dto/update-table.dto'
import { UpdateStatusTableDto } from './dto/update-status-table.dto'
import mongoose from 'mongoose'
import { GuestRestaurantRepository } from 'src/guest-restaurant/model/guest-restaurant.repo'
import { OrderDishSummaryRepository } from 'src/order-dish-summary/model/order-dish-summary.repo'
import { deleteCacheIO } from 'src/utils/cache'
import { KEY_ACCESS_TOKEN_GUEST_RESTAURANT } from 'src/constants/key.redis'
import { TableDocument } from './model/tables.model'

@Injectable()
export class TablesService {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly guestRestaurantRepository: GuestRestaurantRepository,
    private readonly orderDishSummaryRepository: OrderDishSummaryRepository
  ) {}

  async create(createTableDto: CreateTableDto, account: IAccount): Promise<TableDocument> {
    const { tbl_name } = createTableDto
    const { account_restaurant_id } = account
    const table = await this.tableRepository.findOneByName({ tbl_name, tbl_restaurant_id: account_restaurant_id })

    if (table && table.isDeleted === true)
      throw new BadRequestError('Bàn này đã bị xóa, vui lòng khôi phục hoặc tạo bàn mới với tên khác')

    if (table) throw new BadRequestError('Bàn này đã tồn tại, vui lòng tạo bàn mới với tên khác')

    return await this.tableRepository.create(createTableDto, account)
  }

  async findAllPagination(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: TableDocument[]
  }> {
    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 10 : limit

    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }

    const { filter, sort, population } = aqp(qs)

    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10

    const totalItems = await this.tableRepository.totalItems(account, false)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.tableRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
      account,
      false
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

  async findOne(id: string, account: IAccount): Promise<TableDocument> {
    if (!id) throw new BadRequestError('Bàn này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(id) === false) throw new BadRequestError('Bàn này không tồn tại')
    return await this.tableRepository.findOne({ _id: id, account })
  }

  async update(updateTableDto: UpdateTableDto, account: IAccount): Promise<TableDocument> {
    const { _id } = updateTableDto
    const table = await this.tableRepository.findOne({ _id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')

    const nameExist = await this.tableRepository.findAllByNames({
      tbl_name: updateTableDto.tbl_name,
      tbl_restaurant_id: account.account_restaurant_id,
      _id
    })

    if (nameExist.length > 0)
      throw new BadRequestError('Tên bàn này đã tồn tại hoặc đã bị chuyển vào thùng rác, vui lòng sử dụng tên khác')

    return await this.tableRepository.update(updateTableDto, account)
  }

  async remove(id: string, account: IAccount): Promise<TableDocument> {
    if (!id) throw new BadRequestError('Bàn này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(id) === false) throw new BadRequestError('Bàn này không tồn tại')
    const table = await this.tableRepository.findOne({ _id: id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')

    return await this.tableRepository.remove(id, account)
  }

  async findAllRecycle(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: TableDocument[]
  }> {
    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 10 : limit

    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }

    const { filter, sort, population } = aqp(qs)

    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10

    const totalItems = await this.tableRepository.totalItems(account, true)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.tableRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
      account,
      true
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

  async restore(id: string, account: IAccount): Promise<TableDocument> {
    if (!id) throw new BadRequestError('Bàn này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(id) === false) throw new BadRequestError('Bàn này không tồn tại')
    const table = await this.tableRepository.findOne({ _id: id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')

    return await this.tableRepository.restore(id, account)
  }

  async updateStatus(updateStatusTableDto: UpdateStatusTableDto, account: IAccount): Promise<TableDocument> {
    const { _id } = updateStatusTableDto
    const table = await this.tableRepository.findOne({ _id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')
    if (table.tbl_status === 'reserve')
      throw new BadRequestError('Bàn này đang phục vụ, không thể cập nhật trạng thái, vui lòng cập nhật trong đơn hàng')

    return await this.tableRepository.updateStatus(updateStatusTableDto, account)
  }

  async updateToken(id: string, account: IAccount): Promise<TableDocument> {
    if (!id) throw new BadRequestError('Bàn này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(id) === false) throw new BadRequestError('Bàn này không tồn tại')
    const table = await this.tableRepository.findOne({ _id: id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')
    await this.orderDishSummaryRepository.findTableStatusOrderById({
      od_dish_smr_table_id: String(table._id),
      od_dish_smr_status: 'ordering'
    })
    const logout = await this.guestRestaurantRepository.logOutTable({ guest_table_id: String(table._id) })
    logout?.map(async (_id) => {
      await deleteCacheIO(`${KEY_ACCESS_TOKEN_GUEST_RESTAURANT}:${_id}`)
    })

    await this.tableRepository.updateStatus({ _id: String(table._id), tbl_status: 'enable' }, account)

    return await this.tableRepository.updateToken(id, account)
  }

  async findOneByToken({
    tbl_token,
    tbl_restaurant_id
  }: {
    tbl_token: string
    tbl_restaurant_id: string
  }): Promise<TableDocument> {
    return await this.tableRepository.findOneByToken({ tbl_token, tbl_restaurant_id })
  }

  async updateStatusById({ _id, tbl_status }: { _id: string; tbl_status: string }): Promise<TableDocument> {
    return await this.tableRepository.updateStatusById({ _id, tbl_status })
  }

  async findOneById({ _id }: { _id: string }): Promise<TableDocument> {
    return await this.tableRepository.findOneById({ _id })
  }

  async getListTableOrder(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: any
  }> {
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

    if (!filter.tbl_name || typeof filter.tbl_name !== 'string') {
      delete filter.tbl_name
    }

    const validStatuses = ['enable', 'disable', 'serving', 'reserve']

    if (!validStatuses.includes(filter.tbl_status)) {
      delete filter.tbl_status
    }

    const totalItems = await this.tableRepository.totalItemsTableListOrder(filter, account)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const listTable = await this.tableRepository.findPaginationTableListOrder(
      {
        offset,
        defaultLimit,
        sort,
        filter
      },
      account
    )

    const result = await Promise.all(
      listTable.map(async (table) => {
        // Gọi phương thức đếm cho từng table._id riêng biệt
        const orderSummaryCount = await this.orderDishSummaryRepository.findOrderSummaryByTableId({
          od_dish_smr_table_id: table._id.toString() // Truyền riêng từng tableId
        })

        return {
          ...table.toObject(),
          od_dish_smr_count: {
            paid: orderSummaryCount ? orderSummaryCount.paidCount : 0,
            refuse: orderSummaryCount ? orderSummaryCount.refuseCount : 0,
            ordering: orderSummaryCount ? orderSummaryCount.orderingCount : 0,
            guest: orderSummaryCount ? orderSummaryCount.totalGuest : 0
          }
        }
      })
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
