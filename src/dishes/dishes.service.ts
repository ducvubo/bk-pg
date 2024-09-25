import { Injectable } from '@nestjs/common'
import { DishRepository } from './model/dishes.repo'
import { CreateDishDto } from './dto/create-dish.dto'
import { BadRequestError } from 'src/utils/errorResponse'
import { IAccount } from 'src/accounts/accounts.interface'
import aqp from 'api-query-params'
import mongoose from 'mongoose'
import { UpdateDishDto } from './dto/update-dish.dto'
import { UpdateStatusDishDto } from './dto/update-status-dish.dto'

@Injectable()
export class DishesService {
  constructor(private readonly dishRepository: DishRepository) {}

  async createDish(createDishDto: CreateDishDto, account: IAccount) {
    const { dish_name } = createDishDto
    const { account_restaurant_id } = account
    const dish = await this.dishRepository.findOneByName({ dish_name, dish_restaurant_id: account_restaurant_id })

    if (dish && dish.isDeleted === true)
      throw new BadRequestError('Món ăn này đã bị xóa, vui lòng khôi phục hoặc tạo món ăn mới với tên khác')
    if (dish) throw new BadRequestError('Món ăn này đã tồn tại, vui lòng tạo món ăn mới với tên khác')

    return await this.dishRepository.createDish(createDishDto, account)
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

    const totalItems = await this.dishRepository.totalItems(account, false)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    // const population = 'restaurant_category'

    const result = await this.dishRepository.findAllPagination(
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
    if (!id) throw new BadRequestError('Món ăn này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(id) === false) throw new BadRequestError('Món ăn này không tồn tại')
    return await this.dishRepository.findOneById({ _id: id, account })
  }

  async update(updateDishDto: UpdateDishDto, account: IAccount) {
    const { _id, dish_name } = updateDishDto
    const { account_restaurant_id } = account

    const dish = await this.dishRepository.findOneById({ _id, account })

    if (!dish) throw new BadRequestError('Món ăn này không tồn tại')

    const nameExist = await this.dishRepository.findAllByNames({
      dish_name,
      dish_restaurant_id: account_restaurant_id,
      _id
    })

    if (nameExist.length > 0)
      throw new BadRequestError('Tên món ăn này đã tồn tại hoặc đã bị chuyển vào thùng rác, vui lòng sử dụng tên khác')

    return await this.dishRepository.update(updateDishDto, account)
  }

  async remove(id: string, account: IAccount) {
    if (!id) throw new BadRequestError('Món ăn này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(id) === false) throw new BadRequestError('Món ăn này không tồn tại')
    return await this.dishRepository.remove(id, account)
  }

  async restore(id: string, account: IAccount) {
    if (!id) throw new BadRequestError('Món ăn này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(id) === false) throw new BadRequestError('Món ăn này không tồn tại')
    return await this.dishRepository.restore(id, account)
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

    const totalItems = await this.dishRepository.totalItems(account, true)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    // const population = 'restaurant_category'

    const result = await this.dishRepository.findAllPagination(
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

  async updateStatus(updateStatusDishDto: UpdateStatusDishDto, account: IAccount) {
    const { _id } = updateStatusDishDto

    const dish = await this.dishRepository.findOneById({ _id, account })

    if (!dish) throw new BadRequestError('Món ăn này không tồn tại')

    return await this.dishRepository.updateStatus(updateStatusDishDto, account)
  }

  async findAllDishOrder({ dish_restaurant_id }: { dish_restaurant_id: string }) {
    return await this.dishRepository.findAllDishOrder({ dish_restaurant_id })
  }
}
