import { Injectable } from '@nestjs/common'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { RestaurantRepository } from './model/restaurant.repo'
import { BadRequestError, ConflictError, NotFoundError } from 'src/utils/errorResponse'
import { faker } from '@faker-js/faker'
import aqp from 'api-query-params'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { checkDuplicateDays, getHashPassword } from 'src/utils'
import mongoose from 'mongoose'
import { UpdateVerify } from './dto/update-verify.dto'
import { UpdateState } from './dto/update-state.dto'
import { UpdateStatus } from './dto/update-status.dt'
import { IUser } from 'src/users/users.interface'

@Injectable()
export class RestaurantsService {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async create(createRestaurantDto: CreateRestaurantDto, user: IUser) {
    checkDuplicateDays(createRestaurantDto.restaurant_hours)
    const restaurant_email = faker.internet.email(),
      restaurant_phone = faker.phone.number()
    const { restaurant_password } = createRestaurantDto
    const isEmailExist = await this.restaurantRepository.findRestaurantByEmail({ restaurant_email })
    const isPhoneExist = await this.restaurantRepository.findRestaurantByPhone({ restaurant_phone })
    if (isEmailExist) throw new ConflictError('Email này đã được đăng ký')
    if (isPhoneExist) throw new ConflictError('Số điện thoại này đã được đăng ký')

    createRestaurantDto.restaurant_password = getHashPassword(restaurant_password)
    const newRestaurant = await this.restaurantRepository.create(
      {
        restaurant_email,
        restaurant_phone,
        ...createRestaurantDto
      },
      user
    )
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

  async update(updateRestaurantDto: UpdateRestaurantDto, user: IUser) {
    checkDuplicateDays(updateRestaurantDto.restaurant_hours)
    const { _id } = updateRestaurantDto
    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')
    const updated = await this.restaurantRepository.update(updateRestaurantDto, user)

    return {
      _id: updated._id,
      restaurant_name: updated.restaurant_name,
      restaurant_email: updated.restaurant_email,
      restaurant_phone: updated.restaurant_phone
    }
  }

  async remove({ _id }, user: IUser) {
    if (!_id) throw new NotFoundError('Nhà hàng không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhà hàng không tồn tại')
    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')
    const removed = await this.restaurantRepository.remove({ _id }, user)
    return {
      _id: removed._id,
      restaurant_name: removed.restaurant_name,
      restaurant_email: removed.restaurant_email,
      restaurant_phone: removed.restaurant_phone
    }
  }

  async updateVerify(updatevVerify: UpdateVerify, user: IUser) {
    const { _id } = updatevVerify
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhà hàng không tồn tại')
    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')

    const updated = await this.restaurantRepository.updateVerify(updatevVerify, user)
    return {
      _id: updated._id,
      restaurant_name: updated.restaurant_name,
      restaurant_email: updated.restaurant_email,
      restaurant_phone: updated.restaurant_phone,
      restaurant_verify: updated.restaurant_verify
    }
  }

  async updateState(updateState: UpdateState, user: IUser) {
    const { _id } = updateState
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhà hàng không tồn tại')
    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')

    const updated = await this.restaurantRepository.updateState(updateState, user)
    return {
      _id: updated._id,
      restaurant_name: updated.restaurant_name,
      restaurant_email: updated.restaurant_email,
      restaurant_phone: updated.restaurant_phone,
      restaurant_state: updated.restaurant_state
    }
  }

  async updateStatus(updateStatus: UpdateStatus, user: IUser) {
    const { _id } = updateStatus

    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhà hàng không tồn tại')
    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')
    const updated = await this.restaurantRepository.updateStatus(updateStatus, user)
    return {
      _id: updated._id,
      restaurant_name: updated.restaurant_name,
      restaurant_email: updated.restaurant_email,
      restaurant_phone: updated.restaurant_phone,
      restaurant_status: updated.restaurant_status
    }
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

  async restore({ _id }, user: IUser) {
    if (!_id) throw new NotFoundError('Nhà hàng không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhà hàng không tồn tại')
    const restaurantExist = await this.restaurantRepository.findOne({ _id })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')
    const restore = await this.restaurantRepository.restore({ _id }, user)
    return {
      _id: restore._id,
      restaurant_name: restore.restaurant_name,
      restaurant_email: restore.restaurant_email,
      restaurant_phone: restore.restaurant_phone
    }
  }

  async findRestaurantsHome() {
    return await this.restaurantRepository.findRestaurantsHome()
  }

  async findOneBySlug({ restaurant_slug }) {
    if (!restaurant_slug) throw new BadRequestError(`Slug ${restaurant_slug} không hợp lệ`)
    return await this.restaurantRepository.findOneBySlug({ restaurant_slug })
  }
}
