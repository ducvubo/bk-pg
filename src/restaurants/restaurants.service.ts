import { Injectable } from '@nestjs/common'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { RestaurantRepository } from './model/restaurant.repo'
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedCodeError } from 'src/utils/errorResponse'
import { faker } from '@faker-js/faker'
import aqp from 'api-query-params'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { checkDuplicateDays, decodeJwt, isValidPassword } from 'src/utils'
import mongoose from 'mongoose'
import { UpdateVerify } from './dto/update-verify.dto'
import { UpdateState } from './dto/update-state.dto'
import { UpdateStatus } from './dto/update-status.dt'
import { IUser } from 'src/users/users.interface'
import { LoginRestaurantDto } from './dto/login-restaurant.dto'
import { KEY_BLACK_LIST_TOKEN_RESTAURANT } from 'src/constants/key.redis'
import { getCacheIO, setCacheIOExpiration } from 'src/utils/cache'
import { ConfigService } from '@nestjs/config'
import { AccountsService } from 'src/accounts/accounts.service'
import { IAccount } from 'src/accounts/accounts.interface'

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly configService: ConfigService,
    private readonly accountsService: AccountsService
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto, user: IUser) {
    checkDuplicateDays(createRestaurantDto.restaurant_hours)
    createRestaurantDto.restaurant_email = faker.internet.email()
    createRestaurantDto.restaurant_phone = faker.phone.number()
    const { restaurant_password } = createRestaurantDto
    const isEmailExist = await this.restaurantRepository.findRestaurantByEmail({
      restaurant_email: createRestaurantDto.restaurant_email
    })
    const isPhoneExist = await this.restaurantRepository.findRestaurantByPhone({
      restaurant_phone: createRestaurantDto.restaurant_phone
    })
    if (isEmailExist) throw new ConflictError('Email này đã được đăng ký')
    if (isPhoneExist) throw new ConflictError('Số điện thoại này đã được đăng ký')

    const newRestaurant = await this.restaurantRepository.create(createRestaurantDto, user)

    await this.accountsService.createAccount({
      account_email: newRestaurant.restaurant_email,
      account_password: restaurant_password,
      account_type: 'restaurant',
      account_restaurant_id: String(newRestaurant._id)
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
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhà hàng không tồn tại')
    const restaurant = await this.restaurantRepository.findOne({ _id })
    if (!restaurant) throw new NotFoundError('Nhà hàng không tồn tại')
    return restaurant
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

  async loginRestaurant(loginRestaurantDto: LoginRestaurantDto) {
    const { restaurant_email, restaurant_password } = loginRestaurantDto

    const restaurant = await this.restaurantRepository.findOneByEmailWithLogin({ restaurant_email })
    if (!restaurant) throw new UnauthorizedCodeError('Email hoặc mật khẩu không đúng', -1)

    const account = await this.accountsService.findAccountByIdRestaurant({
      account_restaurant_id: String(restaurant._id)
    })

    if (!isValidPassword(restaurant_password, account.account_password))
      throw new UnauthorizedCodeError('Email hoặc mật khẩu không đúng', -1)

    if (restaurant.restaurant_verify === false)
      throw new UnauthorizedCodeError('Nhà hàng chưa được xác thực, vui lòng xác thực trước khi đăng nhập', -2)

    if (restaurant.restaurant_status === 'active' || restaurant.restaurant_status === 'banned')
      throw new UnauthorizedCodeError(
        'Nhà hàng chưa được hoạt động hoặc bị cấm hoạt động, vui lòng liên hệ quản trị viên để biết thêm chi tiết',
        -3
      )

    const token: { access_token_rtr: string; refresh_token_rtr: string } =
      await this.accountsService.generateRefreshTokenCP({ _id: String(account._id) })
    return token
  }

  async findOneByIdOfToken({ _id }: { _id: string }) {
    return await this.restaurantRepository.findOneByIdOfToken({ _id })
  }

  async findRefreshToken({ rf_refresh_token }: { rf_refresh_token: string }) {
    return await this.accountsService.findRefreshToken({ rf_refresh_token })
  }

  async refreshToken({ refresh_token }: { refresh_token: string }) {
    if (refresh_token) {
      const isBlackList = await getCacheIO(`${KEY_BLACK_LIST_TOKEN_RESTAURANT}:${refresh_token}`)
      if (isBlackList) {
        const decodedJWT = decodeJwt(refresh_token)
        await this.accountsService.logoutAll({ rf_cp_epl_id: decodedJWT._id })
        throw new UnauthorizedCodeError('Token đã lỗi vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ 1', -10)
      } else {
        try {
          const key = await this.findRefreshToken({
            rf_refresh_token: refresh_token
          })

          if (!key) throw new UnauthorizedCodeError('Token không hợp lệ 1', -10)
          if (key) {
            const data_refresh_token = this.accountsService.verifyToken(refresh_token, key.rf_public_key_refresh_token)
            const result = await Promise.all([
              await this.accountsService.generateRefreshTokenCP({
                _id: String(data_refresh_token._id)
              }),
              await setCacheIOExpiration(
                `${KEY_BLACK_LIST_TOKEN_RESTAURANT}:${refresh_token}`,
                'hehehehehehehe',
                this.configService.get<string>('JWT_REFRESH_EXPIRE_REDIS')
              ),
              await this.accountsService.deleteToken({
                rf_refresh_token: refresh_token,
                rf_cp_epl_id: data_refresh_token._id
              })
            ])

            return {
              access_token_rtr: result[0].access_token_rtr,
              refresh_token_rtr: result[0].refresh_token_rtr
            }
          }
        } catch (error) {
          console.log(error)
          throw new UnauthorizedCodeError('Token lỗi vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ 2', -10)
        }
      }
    } else {
      throw new UnauthorizedCodeError('Không tìm thấy token ở header', -10)
    }
  }

  async getInforRestaurant(account: IAccount) {
    return this.restaurantRepository.findOneByIdOfToken({ _id: account.account_restaurant_id })
  }
}
