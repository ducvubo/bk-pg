import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Restaurant } from 'src/restaurants/model/restaurant.model'
import { Table } from 'src/tables/model/tables.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type GuestRestaurantDocument = HydratedDocument<GuestRestaurant>

@Schema({ timestamps: true })
export class GuestRestaurant extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name, required: true })
  guest_restaurant_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Table.name, required: true })
  guest_table_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true })
  guest_name: string

  @Prop({ type: String, required: true })
  guest_refresh_token: string
}

export const GuestRestaurantSchema = SchemaFactory.createForClass(GuestRestaurant)
