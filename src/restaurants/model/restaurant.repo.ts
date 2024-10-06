import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Restaurant, RestaurantDocument } from './restaurant.model'
import { Model } from 'mongoose'
import { CreateRestaurantDto } from '../dto/create-restaurant.dto'
import { UpdateRestaurantDto } from '../dto/update-restaurant.dto'
import { UpdateVerify } from '../dto/update-verify.dto'
import { UpdateState } from '../dto/update-state.dto'
import { UpdateStatus } from '../dto/update-status.dt'
import { IUser } from 'src/users/users.interface'
import { generateSlug } from 'src/utils'

@Injectable()
export class RestaurantRepository {
  constructor(@InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>) {}

  async create(createRestaurantDto: CreateRestaurantDto, user: IUser) {
    const {
      restaurant_email,
      restaurant_phone,
      restaurant_category,
      restaurant_name,
      restaurant_banner,
      restaurant_address,
      restaurant_type,
      restaurant_price,
      restaurant_hours,
      restaurant_overview,
      restaurant_amenity,
      restaurant_image,
      restaurant_description
    } = createRestaurantDto

    const { us_email, _id } = user
    const restaurant_slug = generateSlug(restaurant_name)
    return await this.restaurantModel.create({
      restaurant_email,
      restaurant_phone,
      restaurant_category,
      restaurant_name,
      restaurant_slug,
      restaurant_banner,
      restaurant_address,
      restaurant_type,
      restaurant_price,
      restaurant_hours,
      restaurant_overview,
      restaurant_amenity,
      restaurant_image,
      restaurant_description,
      restaurant_verify: true,
      restaurant_status: 'inactive',
      createdBy: {
        email: us_email,
        _id
      }
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
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy')
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
      .populate('restaurant_amenity') // Populate amenities
      .populate('restaurant_type') // Populate restaurant types
  }

  async update(updateRestaurantDto: UpdateRestaurantDto, user: IUser) {
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
      restaurant_overview,
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
          restaurant_overview,
          // restaurant_price_menu,
          restaurant_amenity,
          restaurant_image,
          restaurant_description,
          updatedBy: {
            email: user.us_email,
            _id: user._id
          }
        },
        { new: true }
      )
      .lean()
  }

  async remove({ _id }, user: IUser) {
    return await this.restaurantModel
      .findByIdAndUpdate(
        _id,
        {
          isDeleted: true,
          deletedBy: {
            email: user.us_email,
            _id: user._id
          },
          deletedAt: new Date()
        },
        { new: true }
      )
      .lean()
  }

  async updateVerify(updatevVerify: UpdateVerify, user: IUser) {
    const { _id, status } = updatevVerify
    return await this.restaurantModel
      .findByIdAndUpdate(
        _id,
        {
          restaurant_verify: status,
          updatedBy: {
            email: user.us_email,
            _id: user._id
          }
        },
        {
          new: true
        }
      )
      .lean()
  }

  async updateState(updateState: UpdateState, user: IUser) {
    const { _id, status } = updateState
    return await this.restaurantModel
      .findByIdAndUpdate(
        _id,
        { restaurant_state: status, updatedBy: { email: user.us_email, _id: user._id } },
        {
          new: true
        }
      )
      .lean()
  }

  async updateStatus(updateStatus: UpdateStatus, user: IUser) {
    const { _id, status } = updateStatus
    return await this.restaurantModel
      .findByIdAndUpdate(
        _id,
        { restaurant_status: status, updatedBy: { email: user.us_email, _id: user._id } },
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
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate(population)
      .exec()
  }

  async restore({ _id }, user: IUser) {
    return await this.restaurantModel
      .findByIdAndUpdate(
        _id,
        {
          isDeleted: false,
          updatedBy: {
            email: user.us_email,
            _id: user._id
          }
        },
        { new: true }
      )
      .lean()
  }

  async findRestaurantsHome() {
    return await this.restaurantModel
      .find({
        isDeleted: false,
        restaurant_status: 'inactive',
        restaurant_state: true
      })
      .select('restaurant_name restaurant_banner restaurant_price restaurant_slug')
      .limit(10)
      .exec()
  }

  async findOneBySlug({ restaurant_slug }) {
    return await this.restaurantModel
      .findOne({
        restaurant_slug,
        isDeleted: false,
        restaurant_status: 'inactive',
        restaurant_state: true
      })
      .select(
        '-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedBy -deletedAt -restaurant_status -restaurant_state'
      )
      .populate({
        path: 'restaurant_type', // Tên trường cần populate
        select: 'restaurant_type_name _id'
      })
      .populate({
        path: 'restaurant_amenity', // Tên trường cần populate
        select: 'amenity_name _id'
      })
      .lean()
      .exec()
  }

  async findOneByIdOfBook({ id }: { id: string }) {
    return await this.restaurantModel
      .findOne({
        _id: id,
        isDeleted: false,
        restaurant_status: 'inactive',
        restaurant_state: true
      })
      .lean()
  }

  async findOneByIdOfToken({ _id }: { _id: string }) {
    return await this.restaurantModel
      .findOne({
        _id,
        isDeleted: false,
        restaurant_status: 'inactive'
      })
      .select(' -restaurant_status -__v -updatedBy -updatedAt -createdAt -isDeleted -deletedBy -deletedAt')
      .lean()
  }

  async findOneByEmailWithLogin({ restaurant_email }) {
    return await this.restaurantModel
      .findOne({
        restaurant_email
      })
      .lean()
  }

  async search({ q }) {
    return await this.restaurantModel
      .find({
        restaurant_name: { $regex: q, $options: 'i' },
        isDeleted: false,
        restaurant_status: 'inactive',
        restaurant_state: true
      })
      .select('restaurant_name _id')
      .exec()
  }

  async findOneById({ _id }) {
    return await this.restaurantModel
      .findOne({
        _id,
        restaurant_verify: true,
        restaurant_status: 'inactive',
        restaurant_state: true,
        isDeleted: false
      })
      .lean()
  }
}
