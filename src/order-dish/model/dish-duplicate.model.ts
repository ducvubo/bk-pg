import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Dish } from 'src/dishes/model/dishes.model'
import { ImageUrl } from 'src/restaurants/model/restaurant.model'
import { Restaurant } from 'src/restaurants/model/restaurant.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type DishDuplicateDocument = HydratedDocument<DishDuplicate>

export class Sale {
  @Prop({ type: String, required: true, enum: ['percentage', 'fixed'] })
  sale_type: 'percentage' | 'fixed'

  @Prop({ type: Number, required: true })
  sale_value: number
}

@Schema({ timestamps: true })
export class DishDuplicate extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Dish.name, required: true })
  dish_duplicate_dish_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name, required: true })
  dish_duplicate_restaurant_id: mongoose.Schema.Types.ObjectId

  //tên
  @Prop({ type: String, required: true })
  dish_duplicate_name: string

  //ảnh
  @Prop({ type: ImageUrl, required: true })
  dish_duplicate_image: ImageUrl

  //giá
  @Prop({ type: Number, required: true })
  dish_duplicate_price: number

  //giới thiệu ngắn
  @Prop({ type: String, required: true })
  dish_duplicate_short_description: string

  //sale
  @Prop({ type: Sale })
  dish_duplicate_sale: Sale

  //sự ưu tiên
  @Prop({ type: Number, default: 0 })
  dish_duplicate_priority: number

  //mô tả
  @Prop({ type: String, required: true })
  dish_duplicate_description: string

  //ghi chú
  @Prop({ type: String })
  dish_duplicate_note: string

  //trạng thái
  @Prop({ type: String, required: true, enum: ['enable', 'disable'], default: 'enable' })
  dish_duplicate_status: 'enable' | 'disable'
}

export const DishDuplicateSchema = SchemaFactory.createForClass(DishDuplicate)
