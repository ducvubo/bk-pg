import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { ImageUrl } from 'src/restaurants/model/restaurant.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type CategoryDocument = HydratedDocument<Category>

@Schema({ timestamps: true })
export class Category extends SampleSchema {
  @Prop({ type: String, required: true })
  category_name: string

  @Prop({ type: Object, required: true })
  category_image: ImageUrl

  @Prop({ type: String, required: true })
  category_slug: string

  @Prop({ type: String, required: true })
  category_description: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: Category.name })
  category_parent_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, enums: ['enable', 'disable'], default: 'enable' })
  category_status: 'enable' | 'disable'
}

export const CategorySchema = SchemaFactory.createForClass(Category)
