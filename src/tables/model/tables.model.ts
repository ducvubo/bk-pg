import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { Restaurant } from 'src/restaurants/model/restaurant.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type TableDocument = HydratedDocument<Table>

@Schema({ timestamps: true })
export class Table extends SampleSchema {
  @Prop({ type: String, ref: Restaurant.name, required: true })
  tbl_restaurant_id: string

  @Prop({ type: String, required: true })
  tbl_name: string

  @Prop({ type: String, required: true })
  tbl_description: string

  @Prop({ type: Number, required: true })
  tbl_capacity: number

  @Prop({ type: String, required: true, enums: ['enable', 'disable'], default: 'enable' })
  tbl_status: string

  //token
  @Prop({ type: String, required: true })
  tbl_token: string
}

export const TableSchema = SchemaFactory.createForClass(Table)
