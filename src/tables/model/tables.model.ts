import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Restaurant } from 'src/restaurants/model/restaurant.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type TableDocument = HydratedDocument<Table>

@Schema({ timestamps: true })
export class Table extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name, required: true })
  tbl_restaurant_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true })
  tbl_name: string

  @Prop({ type: String, required: true })
  tbl_description: string

  @Prop({ type: Number, required: true })
  tbl_capacity: number

  //đang hoạt động | ngưng hoạt động | đã đặt trước | đang phục vụ
  @Prop({ type: String, required: true, enums: ['enable', 'disable', 'serving', 'reserve'], default: 'enable' })
  tbl_status: 'enable' | 'disable' | 'serving' | 'reserve'

  //token
  @Prop({ type: String, required: true })
  tbl_token: string
}

export const TableSchema = SchemaFactory.createForClass(Table)
