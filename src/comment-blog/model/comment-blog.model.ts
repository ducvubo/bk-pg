import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Blog } from 'src/blog/model/blog.model'
import { ImageUrl } from 'src/restaurants/model/restaurant.model'
import { User } from 'src/users/model/user.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type CommentBlogDocument = HydratedDocument<CommentBlog>

@Schema({ timestamps: true })
export class CommentBlog extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Blog.name, required: true })
  cmt_blg_blog_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  cmt_blg_user_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: Array, default: [] })
  cmt_blg_image: ImageUrl[]

  @Prop({ type: String, required: true })
  cmt_blg_content: string

  @Prop({ type: Number, default: 0 })
  cmt_blg_left: number

  @Prop({ type: Number, default: 0 })
  cmt_blg_right: number

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: CommentBlog.name })
  cmt_blg_parentId: mongoose.Schema.Types.ObjectId
}

export const CommentBlogSchema = SchemaFactory.createForClass(CommentBlog)
