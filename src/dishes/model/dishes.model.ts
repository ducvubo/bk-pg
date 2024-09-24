import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { ImageUrl } from 'src/restaurants/model/restaurant.model'
import { Restaurant } from 'src/restaurants/model/restaurant.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type DishDocument = HydratedDocument<Dish>

export class Sale {
  @Prop({ type: String, required: true, enum: ['percentage', 'fixed'] })
  sale_type: 'percentage' | 'fixed'

  @Prop({ type: Number, required: true })
  sale_value: number
}

@Schema({ timestamps: true })
export class Dish extends SampleSchema {
  @Prop({ type: String, ref: Restaurant.name, required: true })
  dish_restaurant_id: string

  //tên
  @Prop({ type: String, required: true })
  dish_name: string

  //ảnh
  @Prop({ type: ImageUrl, required: true })
  dish_image: ImageUrl

  //giá
  @Prop({ type: Number, required: true })
  dish_price: number

  //giới thiệu ngắn
  @Prop({ type: String, required: true })
  dish_short_description: string

  //sale
  @Prop({ type: Sale })
  dish_sale: Sale

  //sự ưu tiên
  @Prop({ type: Number, default: 0 })
  dish_priority: number

  //mô tả
  @Prop({ type: String, required: true })
  dish_description: string

  //ghi chú
  @Prop({ type: String })
  dish_note: string

  //trạng thái
  @Prop({ type: String, required: true, enum: ['enable', 'disable'], default: 'enable' })
  dish_status: 'enable' | 'disable'
}

export const DishSchema = SchemaFactory.createForClass(Dish)
