import { Injectable } from '@nestjs/common'
import { GuestRestaurantRepository } from './model/guest-restaurant.repo'
import { LoginGuestRestaurantDto } from './dto/login-guest.dto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RestaurantsService } from 'src/restaurants/restaurants.service'
import { TablesService } from 'src/tables/tables.service'
import { BadRequestError, NotFoundError } from 'src/utils/errorResponse'

@Injectable()
export class GuestRestaurantService {
  constructor(
    private readonly guestRestaurantRepository: GuestRestaurantRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly restaurantsService: RestaurantsService,
    private readonly tablesService: TablesService
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

  async loginGuestRestaurant(loginGuestRestaurantDto: LoginGuestRestaurantDto) {
    const { guest_restaurant_id, guest_table_id } = loginGuestRestaurantDto
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

    loginGuestRestaurantDto.guest_table_id = String(table._id)
    if (table.tbl_status === 'enable') {
      await this.tablesService.updateStatusById({ _id: loginGuestRestaurantDto.guest_table_id, tbl_status: 'reserve' })
    }

    const refresh_token_guest = this.signToken(loginGuestRestaurantDto, 'refresh_token')
    const newGuest = await this.guestRestaurantRepository.loginGuestRestaurant(
      loginGuestRestaurantDto,
      refresh_token_guest
    )

    const access_token_guest = this.signToken({ ...loginGuestRestaurantDto, _id: newGuest._id }, 'access_token')

    return { access_token_guest, refresh_token_guest }
  }

  async refreshToken(refresh_token) {
    const decoded = this.verifyToken(refresh_token, 'refresh_token')
    if (!decoded) throw new BadRequestError('Token không hợp lệ1')

    const guest = await this.guestRestaurantRepository.findOneByRefreshToken({ guest_refresh_token: refresh_token })
    if (!guest) throw new BadRequestError('Token không hợp lệ2')

    const refresh_token_guest = this.signToken(guest, 'refresh_token')
    await this.guestRestaurantRepository.updateRefreshToken({
      _id: String(guest._id),
      guest_refresh_token: refresh_token_guest
    })

    const access_token_guest = this.signToken(guest, 'access_token')
    delete guest.guest_refresh_token

    return { access_token_guest, refresh_token_guest, infor: guest }
  }
}
