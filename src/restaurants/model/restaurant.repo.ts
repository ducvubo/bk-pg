import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Restaurant, RestaurantDocument } from './restaurant.model'
import { Model } from 'mongoose'
import { CreateRestaurantDto } from '../dto/create-restaurant.dto'
import { UpdateRestaurantDto } from '../dto/update-restaurant.dto'
import { UpdateVerify } from '../dto/update-verify.dto'
import { UpdateState } from '../dto/update-state.dto'
import { UpdateStatus } from '../dto/update-status.dt'

@Injectable()
export class RestaurantRepository {
  constructor(@InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    const {
      restaurant_email,
      restaurant_password,
      restaurant_phone,
      restaurant_category,
      restaurant_name,
      restaurant_banner,
      restaurant_address,
      restaurant_type,
      restaurant_price,
      restaurant_hours,
      restaurant_propose,
      restaurant_overview,
      // restaurant_price_menu,
      restaurant_regulation,
      restaurant_parking_area,
      restaurant_amenity,
      restaurant_image,
      restaurant_description
    } = createRestaurantDto
    return await this.restaurantModel.create({
      restaurant_email,
      restaurant_password,
      restaurant_phone,
      restaurant_category,
      restaurant_name,
      restaurant_banner,
      restaurant_address,
      restaurant_type,
      restaurant_price,
      restaurant_hours,
      restaurant_propose,
      restaurant_overview,
      // restaurant_price_menu,
      restaurant_regulation,
      restaurant_parking_area,
      restaurant_amenity,
      restaurant_image,
      restaurant_description,
      restaurant_verify: true,
      restaurant_status: 'active'
    })
  }

  async findRestaurantByEmail({ restaurant_email }: { restaurant_email: string }) {
    return await this.restaurantModel.findOne({ restaurant_email }).lean()
  }

  async findRestaurantByPhone({ restaurant_phone }: { restaurant_phone: string }) {
    return await this.restaurantModel.findOne({ restaurant_phone }).lean()
  }

  async totalItems() {
    return await this.restaurantModel
      .countDocuments({
        isDeleted: false
      })
      .lean()
  }

  async findAllPagination({ offset, defaultLimit, sort, population }) {
    return this.restaurantModel
      .find({
        isDeleted: false
      })
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate(population)
      .exec()
  }

  async findOne({ _id }: { _id: string }) {
    return await this.restaurantModel
      .findById(_id)
      .lean()
      .select('-restaurant_password')
      .populate('restaurant_amenity') // Populate amenities
      .populate('restaurant_type') // Populate restaurant types
  }

  async update(updateRestaurantDto: UpdateRestaurantDto) {
    const {
      _id,
      restaurant_phone,
      restaurant_category,
      restaurant_name,
      restaurant_banner,
      restaurant_address,
      restaurant_type,
      restaurant_price,
      restaurant_hours,
      restaurant_propose,
      restaurant_overview,
      // restaurant_price_menu,
      restaurant_regulation,
      restaurant_parking_area,
      restaurant_amenity,
      restaurant_image,
      restaurant_description
    } = updateRestaurantDto

    return await this.restaurantModel
      .findByIdAndUpdate(
        _id,
        {
          restaurant_phone,
          restaurant_category,
          restaurant_name,
          restaurant_banner,
          restaurant_address,
          restaurant_type,
          restaurant_price,
          restaurant_hours,
          restaurant_propose,
          restaurant_overview,
          // restaurant_price_menu,
          restaurant_regulation,
          restaurant_parking_area,
          restaurant_amenity,
          restaurant_image,
          restaurant_description
        },
        { new: true }
      )
      .lean()
  }

  async remove({ _id }) {
    return await this.restaurantModel.findByIdAndUpdate(_id, { isDeleted: true }, { new: true }).lean()
  }

  async updateVerify(updatevVerify: UpdateVerify) {
    const { _id, status } = updatevVerify
    return await this.restaurantModel
      .findByIdAndUpdate(
        _id,
        { restaurant_verify: status },
        {
          new: true
        }
      )
      .lean()
  }

  async updateState(updateState: UpdateState) {
    const { _id, status } = updateState
    return await this.restaurantModel
      .findByIdAndUpdate(
        _id,
        { restaurant_state: status },
        {
          new: true
        }
      )
      .lean()
  }

  async updateStatus(updateStatus: UpdateStatus) {
    const { _id, status } = updateStatus
    return await this.restaurantModel
      .findByIdAndUpdate(
        _id,
        { restaurant_status: status },
        {
          new: true
        }
      )
      .lean()
  }

  async totalItemsRecycle() {
    return await this.restaurantModel
      .countDocuments({
        isDeleted: true
      })
      .lean()
  }

  async findAllPaginationRecycle({ offset, defaultLimit, sort, population }) {
    return this.restaurantModel
      .find({
        isDeleted: true
      })
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate(population)
      .exec()
  }

  async restore({ _id }) {
    return await this.restaurantModel.findByIdAndUpdate(_id, { isDeleted: false }, { new: true }).lean()
  }
}
