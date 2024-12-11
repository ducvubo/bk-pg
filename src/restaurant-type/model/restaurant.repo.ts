import { InjectModel } from '@nestjs/mongoose'
import { RestaurantType, RestaurantTypeDocument } from './restauran-type.model'
import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'

@Injectable()
export class RestaurantTypeRepository {
  constructor(@InjectModel(RestaurantType.name) private restaurantTypeModel: Model<RestaurantTypeDocument>) {}

  async create({ restaurant_type_name }: { restaurant_type_name: string }): Promise<RestaurantTypeDocument> {
    return await this.restaurantTypeModel.create({ restaurant_type_name })
  }

  async getRestaurantTypelByName({
    restaurant_type_name
  }: {
    restaurant_type_name: string
  }): Promise<RestaurantTypeDocument> {
    return this.restaurantTypeModel.findOne({ restaurant_type_name }).exec()
  }

  async getRestaurantTypeByNameInfor({
    restaurant_type_name
  }: {
    restaurant_type_name: string
  }): Promise<RestaurantTypeDocument[]> {
    return this.restaurantTypeModel.find({
      restaurant_type_name: { $regex: restaurant_type_name, $options: 'i' }
    })
  }

  async findAll(): Promise<RestaurantTypeDocument[]> {
    return await this.restaurantTypeModel.find().select('restaurant_type_name _id').exec()
  }
}
