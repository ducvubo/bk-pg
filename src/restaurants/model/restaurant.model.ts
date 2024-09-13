import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Amenity } from 'src/amenities/model/amenities.model'
import { Category } from 'src/category/model/category.model'
import { RestaurantType } from 'src/restaurant-type/model/restauran-type.model'
import { SampleSchema } from 'src/utils/sample.schema'
import { validDaysOfWeek } from '../dto/create-restaurant.dto'
// import { Role } from 'src/roles/schemas/role.schema'

export type RestaurantDocument = HydratedDocument<Restaurant>

class Address {
  @Prop({ type: String, required: true })
  value: string

  @Prop({ type: String, required: true })
  label: string
}

class RestaurantAddress {
  @Prop({ type: Object, required: true })
  address_province: Address
  @Prop({ type: Object, required: true })
  address_district: Address

  @Prop({ type: Object, required: true })
  address_ward: Address

  @Prop({ type: String, required: true })
  address_specific: string
}

export class MarkDown {
  @Prop({ type: String, required: true })
  text: string

  @Prop({ type: String, required: true })
  html: string
}

class RestaurantPrice {
  @Prop({ type: String, required: true, enum: ['up', 'down', 'range'] })
  restaurant_price_option: string

  @Prop({ type: Number })
  restaurant_price_min?: number

  @Prop({ type: Number })
  restaurant_price_max?: number

  @Prop({ type: Number })
  restaurant_price_amount?: number
}

export class ImageUrl {
  @Prop({ type: String, required: true })
  image_cloud: string

  @Prop({ type: String, required: true })
  image_custom: string
}

class Hour {
  @Prop({ type: String, required: true })
  label: string

  @Prop({ type: Number, required: true })
  value: number
}

class RestaurantHours {
  @Prop({ type: String, enum: validDaysOfWeek, required: true })
  day_of_week: string

  @Prop({ type: Object, required: true })
  open: Hour

  @Prop({ type: Date, required: true })
  close: Hour
}

@Schema({ timestamps: true })
export class Restaurant extends SampleSchema {
  //email
  @Prop({ type: String, required: true })
  restaurant_email: string

  //số điện thoại
  @Prop({ type: String, required: true })
  restaurant_phone: string

  //mật khẩu
  @Prop({ type: String, required: true })
  restaurant_password: string

  // Danh mục
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name, required: true })
  restaurant_category: mongoose.Schema.Types.ObjectId

  // Tên nhà hàng
  @Prop({ type: String, required: true })
  restaurant_name: string

  //slug
  @Prop({ type: String, required: true })
  restaurant_slug: string

  @Prop({ type: Object, required: true })
  restaurant_banner: ImageUrl

  //Địa chỉ
  @Prop({ type: Object, required: true })
  restaurant_address: RestaurantAddress

  //Khoảng giá
  @Prop({ type: Object, required: true })
  restaurant_price: RestaurantPrice

  //Loại hình
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: RestaurantType.name }],
    ref: RestaurantType.name,
    required: true
  })
  restaurant_type: mongoose.Schema.Types.ObjectId[]

  // Tiện ích
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Amenity.name }],
    ref: Amenity.name,
    required: true
  })
  restaurant_amenity: mongoose.Schema.Types.ObjectId[]

  //Hình ảnh nhà hàng
  @Prop({ type: Array, required: true })
  restaurant_image: ImageUrl[]

  //Giờ hoạt động
  @Prop({ type: Array, required: true })
  restaurant_hours: RestaurantHours[]

  //Đề xuất
  @Prop({ type: String, required: true })
  restaurant_propose: string

  //Tóm tắt
  @Prop({ type: String, required: true })
  restaurant_overview: string

  // //Bảng giá
  // @Prop({ type: Array, required: true })
  // restaurant_price_menu: RestaurantPriceMenu

  //Quy định
  @Prop({ type: String, required: true })
  restaurant_regulation: string

  //Chỗ để xe
  @Prop({ type: String, required: true })
  restaurant_parking_area: string

  //Mô tả nhà hàng
  @Prop({ type: String, required: true })
  restaurant_description: string

  //Trạng thái verify
  @Prop({ type: Boolean, required: true })
  restaurant_verify: boolean

  //Trạng thái hoạt động   chưa hoạt đông | đang họat động | cấm hoạt động
  @Prop({ type: String, required: true, enum: ['active', 'inactive', 'banned'] })
  restaurant_status: string

  @Prop({ type: Boolean, required: true, default: true })
  restaurant_state: boolean
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant)
