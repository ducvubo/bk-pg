import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { GuestRestaurant, GuestRestaurantDocument } from './guest-restaurant.model'
import { LoginGuestRestaurantDto } from '../dto/login-guest.dto'
import { IAccount } from 'src/accounts/accounts.interface'

@Injectable()
export class GuestRestaurantRepository {
  constructor(@InjectModel(GuestRestaurant.name) private guestRestaurantModel: Model<GuestRestaurantDocument>) {}

  async loginGuestRestaurant(
    loginGuestRestaurantDto: LoginGuestRestaurantDto,
    refresh_token: string
  ): Promise<GuestRestaurantDocument> {
    const { guest_name, guest_restaurant_id, guest_table_id } = loginGuestRestaurantDto

    return await this.guestRestaurantModel.create({
      guest_name,
      guest_restaurant_id,
      guest_table_id,
      guest_refresh_token: refresh_token,
      guest_type: 'owner'
    })
  }

  // async findOneByRefreshToken({
  //   guest_refresh_token
  // }: {
  //   guest_refresh_token: string
  // }): Promise<GuestRestaurantDocument | null> {
  //   return await this.guestRestaurantModel
  //     .findOne({ guest_refresh_token })
  //     .select('guest_name guest_restaurant_id guest_table_id _id guest_type guest_owner')
  //     .lean()
  // }

  async findOneByRefreshToken({
    guest_refresh_token
  }: {
    guest_refresh_token: string
  }): Promise<GuestRestaurantDocument> {
    return (await this.guestRestaurantModel
      .findOne({ guest_refresh_token })
      .select('guest_name guest_restaurant_id guest_table_id _id guest_type guest_owner')
      .lean()) as GuestRestaurantDocument
  }

  async updateRefreshToken({
    _id,
    guest_refresh_token
  }: {
    _id: string
    guest_refresh_token: string
  }): Promise<GuestRestaurantDocument> {
    return await this.guestRestaurantModel.findByIdAndUpdate({ _id }, { guest_refresh_token })
  }

  async findByName({ guest_name }: { guest_name: string }): Promise<GuestRestaurantDocument[]> {
    return await this.guestRestaurantModel.find({ guest_name: { $regex: guest_name, $options: 'i' } }).select('_id')
  }

  async findOneById({ _id }: { _id: string }): Promise<GuestRestaurantDocument> {
    return await this.guestRestaurantModel.findById({ _id })
  }

  async addMember({
    owner_id,
    owner_name,
    guest_name,
    guest_restaurant_id,
    guest_table_id,
    guest_refresh_token
  }: {
    guest_name: string
    guest_restaurant_id: string
    guest_refresh_token: string
    guest_table_id: string
    owner_id: string
    owner_name: string
  }): Promise<GuestRestaurantDocument> {
    return await this.guestRestaurantModel.create({
      guest_name,
      guest_restaurant_id,
      guest_table_id,
      guest_refresh_token: guest_refresh_token,
      guest_type: 'member',
      guest_owner: { owner_id, owner_name }
    })
  }

  async findListMember({ owner_id }: { owner_id: string }): Promise<GuestRestaurantDocument[]> {
    return await this.guestRestaurantModel
      .find({
        'guest_owner.owner_id': owner_id
      })
      .select('_id')
  }

  async logOutTable({ guest_table_id }: { guest_table_id: string }) {
    const updatedRecords = await this.guestRestaurantModel.find({ guest_table_id }).select('_id')

    await this.guestRestaurantModel.updateMany({ guest_table_id }, { guest_refresh_token: 'null' })

    return updatedRecords.map((record) => record._id)
  }

  async createGuestRestaurant({
    guest_restaurant_id,
    guest_table_id,
    owner_id,
    owner_name,
    createdBy
  }: {
    guest_restaurant_id: string
    guest_table_id: string
    owner_id?: string
    owner_name?: string
    createdBy: {
      _id: string
      email: string
    }
  }): Promise<GuestRestaurantDocument> {
    return await this.guestRestaurantModel.create({
      guest_name: 'Nhân viên order',
      guest_restaurant_id,
      guest_table_id,
      guest_refresh_token: 'null',
      guest_owner: { owner_id, owner_name },
      guest_type: 'member',
      createdBy
    })
  }

  async totalItems(account: IAccount): Promise<number> {
    return await this.guestRestaurantModel.countDocuments({
      guest_restaurant_id: account.account_restaurant_id
    })
  }

  async findAllPagination(
    { offset, defaultLimit, sort, population },
    account: IAccount
  ): Promise<GuestRestaurantDocument[]> {
    return this.guestRestaurantModel
      .find({
        guest_restaurant_id: account.account_restaurant_id
      })
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy -guest_refresh_token')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate({
        path: 'guest_table_id',
        select: 'tbl_name'
      })
      .populate(population)
      .exec()
  }

  async findGuestByOwnerId({ owner_id }: { owner_id: string }) {
    // Đếm số lượng documents thỏa mãn điều kiện
    const count = await this.guestRestaurantModel.countDocuments({
      'guest_owner.owner_id': owner_id
    })

    return count
  }
}
