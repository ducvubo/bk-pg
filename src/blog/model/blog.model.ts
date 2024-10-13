import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { ImageUrl, Restaurant } from 'src/restaurants/model/restaurant.model'
import { TagBlog } from 'src/tag-blog/model/tag-blog.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type BlogDocument = HydratedDocument<Blog>

@Schema({ timestamps: true })
export class Blog extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name, required: true })
  blg_restaurant_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true })
  blg_title: string

  @Prop({ type: String, required: true })
  blg_slug: string

  @Prop({ type: Object, required: true })
  blg_thumbnail: ImageUrl

  @Prop({ type: String, required: true })
  blg_content: string

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: TagBlog.name }],
    ref: TagBlog.name,
    required: true
  })
  blg_tag: mongoose.Schema.Types.ObjectId[]

  @Prop({ type: Number, default: 10 })
  blg_priority: number

  //like mảng guest_id
  @Prop({ type: [String], default: [] })
  blg_like: string[]

  @Prop({ type: String, required: true, enum: ['draft', 'publish'], default: 'draft' })
  blg_status: 'draft' | 'publish'

  //admin
  @Prop({ type: String, required: true, enum: ['active', 'inactive'], default: 'inactive' })
  blg_verify: 'inactive' | 'active'
}

export const BlogSchema = SchemaFactory.createForClass(Blog)
