import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { ImageUrl } from 'src/restaurants/model/restaurant.model'
import { Restaurant } from 'src/restaurants/model/restaurant.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type CategoryRestaurantDocument = HydratedDocument<CategoryRestaurant>

@Schema({ timestamps: true })
export class CategoryRestaurant extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name, required: true })
  cat_res_id: mongoose.Schema.Types.ObjectId

  //tên
  @Prop({ type: String, required: true })
  cat_res_name: string

  //slug
  @Prop({ type: String, required: true })
  cat_res_slug: string

  //icon
  @Prop({ type: ImageUrl, required: true })
  cat_res_icon: ImageUrl

  //Giới thiệu ngắn
  @Prop({ type: String, required: true })
  cat_res_short_description: string

  //trạng thái
  @Prop({ type: String, required: true, enum: ['enable', 'disable'], default: 'enable' })
  cat_res_status: 'enable' | 'disable'
}

export const CategoryRestaurantSchema = SchemaFactory.createForClass(CategoryRestaurant)
