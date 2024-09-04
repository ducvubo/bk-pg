import { Injectable } from '@nestjs/common'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { RestaurantRepository } from './model/restaurant.repo'
import { BadRequestError, ConflictError, NotFoundError } from 'src/utils/errorResponse'
import { faker } from '@faker-js/faker'
import aqp from 'api-query-params'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { checkDuplicateDays, getHassPassword } from 'src/utils'
import mongoose from 'mongoose'
import { UpdateVerify } from './dto/update-verify.dto'
import { UpdateState } from './dto/update-state.dto'
import { UpdateStatus } from './dto/update-status.dt'

@Injectable()
export class RestaurantsService {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    checkDuplicateDays(createRestaurantDto.restaurant_hours)
    const restaurant_email = faker.internet.email(),
      restaurant_phone = faker.phone.number()
    const { restaurant_password } = createRestaurantDto
    const isEmailExist = await this.restaurantRepository.findRestaurantByEmail({ restaurant_email })
    const isPhoneExist = await this.restaurantRepository.findRestaurantByPhone({ restaurant_phone })
    if (isEmailExist) throw new ConflictError('Email này đã được đăng ký')
    if (isPhoneExist) throw new ConflictError('Số điện thoại này đã được đăng ký')

    createRestaurantDto.restaurant_password = getHassPassword(restaurant_password)
    const newRestaurant = await this.restaurantRepository.create({
      restaurant_email,
      restaurant_phone,
      ...createRestaurantDto
    })
    if (newRestaurant) {
      return {
        _id: newRestaurant._id,
        restaurant_name: newRestaurant.restaurant_name,
        restaurant_email: newRestaurant.restaurant_email,
        restaurant_phone: newRestaurant.restaurant_phone
      }
    }
  }

  async findRestaurantByEmail({ restaurant_email }: { restaurant_email: string }) {
    return await this.restaurantRepository.findRestaurantByEmail({ restaurant_email })
  }

  async findAll({ currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string }) {
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

    const totalItems = await this.restaurantRepository.totalItems()
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const population = 'restaurant_category'

    const result = await this.restaurantRepository.findAllPagination({
      offset,
      defaultLimit,
      sort,
      population
    })

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

  async findOne({ _id }: { _id: string }) {
    return await this.restaurantRepository.findOne({ _id })
  }

  async update(updateRestaurantDto: UpdateRestaurantDto) {
    checkDuplicateDays(updateRestaurantDto.restaurant_hours)
    const { _id } = updateRestaurantDto
    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')
    return await this.restaurantRepository.update(updateRestaurantDto)
  }

  async remove({ _id }) {
    if (!_id) throw new NotFoundError('Nhà hàng không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhà hàng không tồn tại')
    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')
    return await this.restaurantRepository.remove({ _id })
  }

  async updateVerify(updatevVerify: UpdateVerify) {
    const { _id } = updatevVerify

    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')

    return await this.restaurantRepository.updateVerify(updatevVerify)
  }

  async updateState(updateState: UpdateState) {
    const { _id } = updateState

    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')

    return await this.restaurantRepository.updateState(updateState)
  }

  async updateStatus(updateStatus: UpdateStatus) {
    const { _id } = updateStatus

    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')

    return await this.restaurantRepository.updateStatus(updateStatus)
  }

  async findAllRecycle({ currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string }) {
    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }
    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 8 : limit

    const { filter, sort } = aqp(qs)

    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10

    const totalItems = await this.restaurantRepository.totalItemsRecycle()
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const population = 'restaurant_category'

    const result = await this.restaurantRepository.findAllPaginationRecycle({
      offset,
      defaultLimit,
      sort,
      population
    })

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

  async restore({ _id }) {
    if (!_id) throw new NotFoundError('Nhà hàng không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhà hàng không tồn tại')
    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')
    return await this.restaurantRepository.restore({ _id })
  }
}
