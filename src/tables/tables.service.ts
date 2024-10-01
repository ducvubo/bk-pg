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
import { setCacheIOExpiration } from 'src/utils/cache'
import { KEY_LOGOUT_TABLE_RESTAURANT } from 'src/constants/key.redis'

@Injectable()
export class TablesService {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly guestRestaurantRepository: GuestRestaurantRepository,
    private readonly orderDishSummaryRepository: OrderDishSummaryRepository
  ) {}

  async create(createTableDto: CreateTableDto, account: IAccount) {
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
  ) {
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

    // const population = 'restaurant_category'

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

  async findOne(id: string, account: IAccount) {
    if (!id) throw new BadRequestError('Bàn này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(id) === false) throw new BadRequestError('Bàn này không tồn tại')
    return await this.tableRepository.findOne({ _id: id, account })
  }

  async update(updateTableDto: UpdateTableDto, account: IAccount) {
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

  async remove(id: string, account: IAccount) {
    if (!id) throw new BadRequestError('Bàn này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(id) === false) throw new BadRequestError('Bàn này không tồn tại')
    const table = await this.tableRepository.findOne({ _id: id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')

    return await this.tableRepository.remove(id, account)
  }

  async findAllRecycle(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ) {
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

  async restore(id: string, account: IAccount) {
    if (!id) throw new BadRequestError('Bàn này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(id) === false) throw new BadRequestError('Bàn này không tồn tại')
    const table = await this.tableRepository.findOne({ _id: id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')

    return await this.tableRepository.restore(id, account)
  }

  async updateStatus(updateStatusTableDto: UpdateStatusTableDto, account: IAccount) {
    const { _id } = updateStatusTableDto
    const table = await this.tableRepository.findOne({ _id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')
    if (table.tbl_status === 'reserve')
      throw new BadRequestError('Bàn này đang phục vụ, không thể cập nhật trạng thái, vui lòng cập nhật trong đơn hàng')

    return await this.tableRepository.updateStatus(updateStatusTableDto, account)
  }

  async updateToken(id: string, account: IAccount) {
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
      await setCacheIOExpiration(`${KEY_LOGOUT_TABLE_RESTAURANT}:${_id}`, 'hehehehehehehehe', 900)
    })

    await this.tableRepository.updateStatus({ _id: String(table._id), tbl_status: 'enable' }, account)

    return await this.tableRepository.updateToken(id, account)
  }

  async findOneByToken({ tbl_token, tbl_restaurant_id }: { tbl_token: string; tbl_restaurant_id: string }) {
    return await this.tableRepository.findOneByToken({ tbl_token, tbl_restaurant_id })
  }

  async updateStatusById({ _id, tbl_status }: { _id: string; tbl_status: string }) {
    return await this.tableRepository.updateStatusById({ _id, tbl_status })
  }

  async findOneById({ _id }: { _id: string }) {
    return await this.tableRepository.findOneById({ _id })
  }

  async getListTableOrder(account: IAccount) {
    return await this.tableRepository.getListTableOrder(account)
  }
}
