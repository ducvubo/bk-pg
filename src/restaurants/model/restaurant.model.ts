import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Amenity } from 'src/amenities/model/amenities.model'
import { Category } from 'src/category/model/category.model'
import { RestaurantType } from 'src/restaurant-type/model/restauran-type.model'
import { SampleSchema } from 'src/utils/sample.schema'
// import { Role } from 'src/roles/schemas/role.schema'

export type RestaurantDocument = HydratedDocument<Restaurant>

export class MarkDown {
  @Prop({ type: String, required: true })
  markdown_text: string

  @Prop({ type: String, required: true })
  markdown_html: string
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

class RestaurantHours {
  @Prop({ type: Date, required: true })
  day_of_week: Date

  @Prop({ type: Date, required: true })
  open: Date

  @Prop({ type: Date, required: true })
  close: Date
}

class RestaurantPropose {
  //Tư vấn-giữ chỗ
  @Prop({ type: Object, required: true })
  propose_consultation_reservation: MarkDown

  //Ưu đãi tặng kèm
  @Prop({ type: Object, required: true })
  propose_bundled_offer: MarkDown

  //Lưu ý
  @Prop({ type: Object, required: true })
  propose_note: MarkDown
}

class RestaurantOverview {
  //Phù hợp
  @Prop({ type: Array, required: true })
  overview_suitable: string[]

  //Món đặc sắc
  @Prop({ type: Array, required: true })
  overview_specialty_dish: string[]

  //Không gian
  @Prop({ type: Array, required: true })
  overview_space: string

  //Để xe
  @Prop({ type: Array, required: true })
  overview_parking_area: string[]

  //Đặc trưng
  @Prop({ type: Array, required: true })
  overview_characteristic: string[]
}

class RestaurantPriceMenu {
  // Tên món ăn
  @Prop({ type: String, required: true })
  price_menu_name: string

  // Đi kèm
  @Prop({ type: String, required: true })
  price_menu_detail: string

  //giá
  @Prop({ type: Number, required: true })
  price_menu_amount: number
}

// class RestaurantAmenity {
//   //Tên tiện ích
//   @Prop({ type: String, required: true })
//   amenity_name: string

//   //id
//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Amenity.name, required: true })
//   amenity_id: mongoose.Schema.Types.ObjectId
// }

@Schema({ timestamps: true })
export class Restaurant extends SampleSchema {
  // Danh mục
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name, required: true })
  restaurant_category: mongoose.Schema.Types.ObjectId

  // Tên nhà hàng
  @Prop({ type: String, required: true })
  restaurant_name: string

  @Prop({ type: String, required: true })
  restaurant_banner: ImageUrl

  //Địa chỉ
  @Prop({ type: String, required: true })
  restaurant_address: string

  //Loại hình
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: RestaurantType.name }],
    ref: RestaurantType.name,
    required: true
  })
  restaurant_type: mongoose.Schema.Types.ObjectId[]

  //Khoảng giá
  @Prop({ type: Object, required: true })
  restaurant_price: RestaurantPrice

  //Giờ hoạt động
  @Prop({ type: Array, required: true })
  restaurant_hours: RestaurantHours[]

  //Đề xuất
  @Prop({ type: Object, required: true })
  restaurant_propose: RestaurantPropose

  //Tóm tắt
  @Prop({ type: Object, required: true })
  restaurant_overview: RestaurantOverview

  //Bảng giá
  @Prop({ type: Array, required: true })
  restaurant_price_menu: RestaurantPriceMenu

  //Quy định
  @Prop({ type: Object, required: true })
  restaurant_regulation: MarkDown

  //Chỗ để xe
  @Prop({ type: Object, required: true })
  restaurant_parking_area: MarkDown

  // Tiện ích
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: RestaurantType.name }],
    ref: Amenity.name,
    required: true
  })
  restaurant_amenity: mongoose.Schema.Types.ObjectId[]

  //Hình ảnh nhà hàng
  @Prop({ type: Array, required: true })
  restaurant_image: ImageUrl[]

  //Mô tả nhà hàng
  @Prop({ type: Object, required: true })
  restaurant_description: MarkDown

  //Trạng thái verify
  @Prop({ type: Boolean, required: true })
  restaurant_verify: boolean

  //Trạng thái hoạt động   chưa hoạt đông | đang họat động | cấm hoạt động
  @Prop({ type: String, required: true, enum: ['active', 'inactive', 'banned'] })
  restaurant_status: string
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant)
