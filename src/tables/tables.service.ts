import { Injectable } from '@nestjs/common'
import { TableRepository } from './model/tables.repo'
import { CreateTableDto } from './dto/create-table.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { BadRequestError } from 'src/utils/errorResponse'
import aqp from 'api-query-params'
import { UpdateTableDto } from './dto/update-table.dto'
import { UpdateStatusTableDto } from './dto/update-status-table.dto'

@Injectable()
export class TablesService {
  constructor(private readonly tableRepository: TableRepository) {}

  async create(createTableDto: CreateTableDto, account: IAccount) {
    const { tbl_name } = createTableDto
    const { restaurant_id } = account
    const table = await this.tableRepository.findOneByName({ tbl_name, tbl_restaurant_id: restaurant_id })

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
    return await this.tableRepository.findOneById({ _id: id, account })
  }

  async update(updateTableDto: UpdateTableDto, account: IAccount) {
    const { _id } = updateTableDto
    const table = await this.tableRepository.findOneById({ _id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')

    const nameExist = await this.tableRepository.findAllByNames({
      tbl_name: updateTableDto.tbl_name,
      tbl_restaurant_id: account.restaurant_id,
      _id
    })

    if (nameExist.length > 0)
      throw new BadRequestError('Tên bàn này đã tồn tại hoặc đã bị chuyển vào thùng rác, vui lòng sử dụng tên khác')

    return await this.tableRepository.update(updateTableDto, account)
  }

  async remove(id: string, account: IAccount) {
    const table = await this.tableRepository.findOneById({ _id: id, account })
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
    const table = await this.tableRepository.findOneById({ _id: id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')

    return await this.tableRepository.restore(id, account)
  }

  async updateStatus(updateStatusTableDto: UpdateStatusTableDto, account: IAccount) {
    const { _id } = updateStatusTableDto
    const table = await this.tableRepository.findOneById({ _id, account })
    if (!table) throw new BadRequestError('Bàn này không tồn tại')

    return await this.tableRepository.updateStatus(updateStatusTableDto, account)
  }
}
