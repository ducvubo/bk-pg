import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { GuestRestaurantRepository } from './model/guest-restaurant.repo'
import { LoginGuestRestaurantDto } from './dto/login-guest.dto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RestaurantsService } from 'src/restaurants/restaurants.service'
import { TablesService } from 'src/tables/tables.service'
import { BadRequestError, NotFoundError } from 'src/utils/errorResponse'
import { IGuest } from './guest.interface'
import { AddMemberDto } from './dto/add-member.dto'
import { OrderDishSummaryRepository } from 'src/order-dish-summary/model/order-dish-summary.repo'
import { SocketGateway } from 'src/socket/socket.gateway'
import { KEY_SOCKET_GUEST_ORDER_DISH_SUMMARY_ID, KEY_SOCKET_RESTAURANT_ID } from 'src/constants/key.socket'
import { setCacheIOExpiration } from 'src/utils/cache'
import { KEY_ACCESS_TOKEN_GUEST_RESTAURANT } from 'src/constants/key.redis'
import mongoose from 'mongoose'

@Injectable()
export class GuestRestaurantService {
  constructor(
    private readonly guestRestaurantRepository: GuestRestaurantRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly restaurantsService: RestaurantsService,
    private readonly tablesService: TablesService,
    @Inject(forwardRef(() => OrderDishSummaryRepository))
    private readonly orderDishSummaryRepository: OrderDishSummaryRepository,
    private readonly socketGateway: SocketGateway
  ) {}

  signToken(data: any, type: 'access_token' | 'refresh_token') {
    const token = this.jwtService.sign(data, {
      secret:
        type === 'access_token'
          ? this.configService.get<string>('JWT_ACCESSTOKEN_GUEST_RESTAURANT_SECRET')
          : this.configService.get<string>('JWT_REFRESHTOKEN_GUEST_RESTAURANT_SECRET'),
      expiresIn:
        type === 'access_token'
          ? this.configService.get<string>('JWT_ACCESSTOKEN_GUEST_RESTAURANT_EXPIRE')
          : this.configService.get<string>('JWT_REFRESHTOKEN_GUEST_RESTAURANT_EXPIRE')
    })

    return token
  }

  verifyToken(token: string, type: 'access_token' | 'refresh_token') {
    try {
      const decoded = this.jwtService.verify(token, {
        secret:
          type === 'access_token'
            ? this.configService.get<string>('JWT_ACCESSTOKEN_GUEST_RESTAURANT_SECRET')
            : this.configService.get<string>('JWT_REFRESHTOKEN_GUEST_RESTAURANT_SECRET')
      })
      return decoded
    } catch (error) {
      console.log(error)
    }
  }

  signTokenAdd(data: any) {
    const token = this.jwtService.sign(data, {
      secret: this.configService.get<string>('JWT_TOKEN_GUEST_ADD_MEMBER_SECRET'),
      expiresIn: this.configService.get<string>('JWT_TOKEN_GUEST_ADD_MEMBER_EXPIRE')
    })

    return token
  }

  verifyTokenAdd(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_TOKEN_GUEST_ADD_MEMBER_SECRET')
      })
      return decoded
    } catch (error) {
      console.log(error)
    }
  }

  async loginGuestRestaurant(loginGuestRestaurantDto: LoginGuestRestaurantDto) {
    const { guest_restaurant_id, guest_table_id, guest_name } = loginGuestRestaurantDto
    if (guest_name === 'Nhân viên order') throw new BadRequestError('Vui lòng nhập tên khác')
    const restaurant = await this.restaurantsService.findOneById({ _id: guest_restaurant_id })
    if (!restaurant)
      throw new NotFoundError('Nhà hàng không tồn tại, vui lòng kiểm tra lại hoặc thông báo với nhân viên quán')
    const table = await this.tablesService.findOneByToken({
      tbl_token: guest_table_id,
      tbl_restaurant_id: guest_restaurant_id
    })
    if (!table && table.tbl_status === 'disable')
      throw new NotFoundError('Bàn này không tồn tại, vui lòng kiểm tra lại hoặc thông báo với nhân viên quán')

    if (!table && table.tbl_status === 'serving')
      throw new NotFoundError('Bàn này đã được đặt trước, vui lòng chọn bàn khác hoặc thông báo với nhân viên quán')

    if (table && table.tbl_status === 'reserve')
      throw new NotFoundError(
        'Bàn này đã có khách ngồi liên hệ với chủ bàn để order, vui lòng chọn bàn khác hoặc thông báo với nhân viên quán'
      )

    loginGuestRestaurantDto.guest_table_id = String(table._id)
    if (table.tbl_status === 'enable') {
      await this.tablesService.updateStatusById({ _id: loginGuestRestaurantDto.guest_table_id, tbl_status: 'reserve' })
    }

    const refresh_token_guest = this.signToken(loginGuestRestaurantDto, 'refresh_token')
    const newGuest = await this.guestRestaurantRepository.loginGuestRestaurant(
      loginGuestRestaurantDto,
      refresh_token_guest
    )

    const newOrder = await this.orderDishSummaryRepository.createOrderDishSummary({
      od_dish_smr_restaurant_id: guest_restaurant_id,
      od_dish_smr_guest_id: String(newGuest._id),
      od_dish_smr_table_id: String(table._id)
    })

    const access_token_guest = this.signToken(
      {
        ...loginGuestRestaurantDto,
        _id: newGuest._id,
        guest_type: newGuest.guest_type,
        order_id: newOrder._id
      },
      'access_token'
    )

    await setCacheIOExpiration(`${KEY_ACCESS_TOKEN_GUEST_RESTAURANT}:${newGuest._id}`, access_token_guest, 900)

    this.socketGateway.handleEmitSocket({
      to: `${KEY_SOCKET_RESTAURANT_ID}:${guest_restaurant_id}`,
      event: 'login_guest_table',
      data: {
        guest_name: loginGuestRestaurantDto.guest_name,
        tbl_name: table.tbl_name
      }
    })

    return { access_token_guest, refresh_token_guest }
  }

  async refreshToken(refresh_token) {
    const decoded = this.verifyToken(refresh_token, 'refresh_token')
    if (!decoded) throw new BadRequestError('Token không hợp lệ1')

    const guest = await this.guestRestaurantRepository.findOneByRefreshToken({ guest_refresh_token: refresh_token })
    if (!guest) throw new BadRequestError('Token không hợp lệ2')

    // const refresh_token_guest = this.signToken(guest, 'refresh_token')
    // await this.guestRestaurantRepository.updateRefreshToken({
    //   _id: String(guest._id),
    //   guest_refresh_token: refresh_token_guest
    // })
    let order
    if (guest.guest_type === 'owner') {
      order = await this.orderDishSummaryRepository.findOneByGuestId({ od_dish_smr_guest_id: String(guest._id) })
    } else if (guest.guest_type === 'member') {
      order = await this.orderDishSummaryRepository.findOneByGuestId({
        od_dish_smr_guest_id: String(guest.guest_owner.owner_id)
      })
    }

    const access_token_guest = this.signToken({ ...guest, order_id: order._id }, 'access_token')
    delete guest.guest_refresh_token
    await setCacheIOExpiration(`${KEY_ACCESS_TOKEN_GUEST_RESTAURANT}:${guest._id}`, access_token_guest, 900)

    return { access_token_guest, refresh_token_guest: refresh_token, infor: guest }
  }

  async generateTokenAddMember(guest: IGuest) {
    if (guest.guest_type !== 'owner') throw new BadRequestError('Chỉ chủ bàn mới có quyền thêm thành viên')

    const order = await this.orderDishSummaryRepository.findOneById({ _id: guest.order_id })
    if (!order) throw new BadRequestError('Vui lòng quét lại qr code để thêm thành viên')

    if (order.od_dish_smr_status === 'paid')
      throw new BadRequestError('Bàn này đã thanh toán không thể thêm thành viên')
    if (order.od_dish_smr_status === 'refuse')
      throw new BadRequestError('Bàn này đã từ chối order không thể thêm thành viên')

    const token = this.signTokenAdd({
      guest_owner_id: guest._id,
      guest_restaurant_id: guest.guest_restaurant_id,
      guest_table_id: guest.guest_table_id,
      order_id: order._id
    })

    return token
  }

  async addMember(addMemberDto: AddMemberDto) {
    const { token, guest_name } = addMemberDto
    if (guest_name === 'Nhân viên order') throw new BadRequestError('Vui lòng nhập tên khác')
    const decoded = this.verifyTokenAdd(token)
    if (!decoded) throw new BadRequestError('Vui lòng quét lại qr code để thêm thành viên1')

    const { guest_owner_id, guest_restaurant_id, guest_table_id } = decoded
    const guestOwner = await this.guestRestaurantRepository.findOneById({ _id: guest_owner_id })
    if (!guestOwner) throw new BadRequestError('Vui lòng quét lại qr code để thêm thành viên')

    const restaurant = await this.restaurantsService.findOneById({ _id: guest_restaurant_id })
    if (!restaurant)
      throw new NotFoundError('Nhà hàng không tồn tại, vui lòng kiểm tra lại hoặc thông báo với nhân viên quán')
    const table = await this.tablesService.findOneById({
      _id: guest_table_id
    })
    if (!table && table.tbl_status === 'disable')
      throw new NotFoundError('Bàn này không tồn tại, vui lòng kiểm tra lại hoặc thông báo với nhân viên quán')

    if (!table && table.tbl_status === 'serving')
      throw new NotFoundError('Bàn này đã được đặt trước, vui lòng chọn bàn khác hoặc thông báo với nhân viên quán')

    if (!table && table.tbl_status !== 'reserve')
      throw new NotFoundError(
        'Bàn này chưa có khách ngồi vui lòng quét qr của bàn, vui lòng chọn bàn khác hoặc thông báo với nhân viên quán'
      )

    const order = await this.orderDishSummaryRepository.findOneById({ _id: decoded.order_id })
    if (!order) throw new BadRequestError('Vui lòng quét lại qr code để thêm thành viên')

    if (order.od_dish_smr_status === 'paid')
      throw new BadRequestError('Bàn này đã thanh toán không thể thêm thành viên')
    if (order.od_dish_smr_status === 'refuse')
      throw new BadRequestError('Bàn này đã từ chối order không thể thêm thành viên')

    // loginGuestRestaurantDto.guest_table_id = String(table._id)
    // if (table.tbl_status === 'enable') {
    //   await this.tablesService.updateStatusById({ _id: loginGuestRestaurantDto.guest_table_id, tbl_status: 'reserve' })
    // }

    const refresh_token_guest = this.signToken(
      {
        guest_name: guest_name,
        guest_table_id: guest_table_id,
        guest_restaurant_id: guest_restaurant_id
      },
      'refresh_token'
    )
    const newGuest = await this.guestRestaurantRepository.addMember({
      guest_name: guest_name,
      guest_table_id: guest_table_id,
      guest_restaurant_id: guest_restaurant_id,
      guest_refresh_token: refresh_token_guest,
      owner_id: String(guestOwner._id),
      owner_name: guestOwner.guest_name
    })

    const access_token_guest = this.signToken(
      {
        guest_name: guest_name,
        guest_table_id: guest_table_id,
        guest_restaurant_id: guest_restaurant_id,
        _id: newGuest._id,
        guest_type: newGuest.guest_type,
        order_id: order._id
      },
      'access_token'
    )

    await setCacheIOExpiration(`${KEY_ACCESS_TOKEN_GUEST_RESTAURANT}:${newGuest._id}`, access_token_guest, 900)

    this.socketGateway.handleEmitSocket({
      to: `${KEY_SOCKET_GUEST_ORDER_DISH_SUMMARY_ID}:${decoded.order_id}`,
      event: 'add_member',
      data: {
        guest_name: guest_name
      }
    })

    return {
      access_token_guest,
      refresh_token_guest
    }
  }

  async getToken({ _id }: { _id: string }) {
    if (!_id) throw new BadRequestError('Vị khách này không tồn tại, vui lòng thử lại sau ít phút')
    if (mongoose.Types.ObjectId.isValid(_id) === false)
      throw new BadRequestError('Vị khách này không tồn tại, vui lòng thử lại sau ít phút')

    const orderSummary = await this.orderDishSummaryRepository.findOneByGuestId({ od_dish_smr_guest_id: _id })
    if (!orderSummary) throw new BadRequestError('Vị khách này không tồn tại, vui lòng thử lại sau ít phút')
    if (orderSummary.od_dish_smr_status === 'paid')
      throw new BadRequestError('Đơn hàng đã thanh toán không thể lấy qr code')
    if (orderSummary.od_dish_smr_status === 'refuse')
      throw new BadRequestError('Đơn hàng đã từ chối không thể lấy qr code')

    const guest = await this.guestRestaurantRepository.findOneById({ _id })
    if (!guest) throw new BadRequestError('Vị khách này không tồn tại, vui lòng thử lại sau ít phút')
    if (guest.guest_name === 'Nhân viên order')
      throw new BadRequestError('Hóa đơn này dó nhân viên order tạo ra, không thể lấy qr code')

    if (guest.guest_refresh_token) {
      return {
        refresh_token: guest.guest_refresh_token
      }
    } else {
      const refresh_token_guest = this.signToken(
        {
          guest_name: guest.guest_name,
          guest_table_id: guest.guest_table_id,
          guest_restaurant_id: guest.guest_restaurant_id
        },
        'refresh_token'
      )
      await this.guestRestaurantRepository.updateRefreshToken({
        _id: _id,
        guest_refresh_token: refresh_token_guest
      })
      return {
        refresh_token: refresh_token_guest
      }
    }
  }
}
