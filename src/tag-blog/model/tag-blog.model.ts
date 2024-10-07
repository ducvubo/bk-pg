import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { SampleSchema } from 'src/utils/sample.schema'

export type TagBlogDocument = HydratedDocument<TagBlog>

@Schema({ timestamps: true })
export class TagBlog extends SampleSchema {
  @Prop({ type: String, required: true })
  tag_name: string
}

export const TagBlogSchema = SchemaFactory.createForClass(TagBlog)
