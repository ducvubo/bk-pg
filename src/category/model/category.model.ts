import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { SampleSchema } from 'src/utils/sample.schema'

export type CategoryDocument = HydratedDocument<Category>

@Schema({ timestamps: true })
export class Category extends SampleSchema {
  // Tên tiện ích
  @Prop({ type: String, required: true })
  category_name: string
}

export const CategorySchema = SchemaFactory.createForClass(Category)
