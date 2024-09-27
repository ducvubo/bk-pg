import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { GuestRestaurant, GuestRestaurantDocument } from './guest-restaurant.model'
import { LoginGuestRestaurantDto } from '../dto/login-guest.dto'

@Injectable()
export class GuestRestaurantRepository {
  constructor(@InjectModel(GuestRestaurant.name) private guestRestaurantModel: Model<GuestRestaurantDocument>) {}

  async loginGuestRestaurant(loginGuestRestaurantDto: LoginGuestRestaurantDto, refresh_token: string) {
    const { guest_name, guest_restaurant_id, guest_table_id } = loginGuestRestaurantDto

    return await this.guestRestaurantModel.create({
      guest_name,
      guest_restaurant_id,
      guest_table_id,
      guest_refresh_token: refresh_token
    })
  }

  async findOneByRefreshToken({ guest_refresh_token }: { guest_refresh_token: string }) {
    return await this.guestRestaurantModel
      .findOne({ guest_refresh_token })
      .select('guest_name guest_restaurant_id guest_table_id _id')
      .lean()
  }

  async updateRefreshToken({ _id, guest_refresh_token }: { _id: string; guest_refresh_token: string }) {
    return await this.guestRestaurantModel.findByIdAndUpdate({ _id }, { guest_refresh_token })
  }

  async findByName({ guest_name }: { guest_name: string }) {
    return await this.guestRestaurantModel.find({ guest_name: { $regex: guest_name, $options: 'i' } }).select('_id')
  }
}
