import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Restaurant } from 'src/restaurants/model/restaurant.model'
import { Table } from 'src/tables/model/tables.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type GuestRestaurantDocument = HydratedDocument<GuestRestaurant>

class Guest_Owner {
  @Prop({ type: String, required: true })
  owner_id: string

  @Prop({ type: String, required: true })
  owner_name: string
}

@Schema({ timestamps: true })
export class GuestRestaurant extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name, required: true })
  guest_restaurant_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Table.name, required: true })
  guest_table_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true })
  guest_name: string

  //type
  // thành viên hoặc chủ bàn
  @Prop({ type: String, required: true, enum: ['member', 'owner'] })
  guest_type: 'member' | 'owner'

  //nếu type là thành viên thì sẽ có của chủ bàn
  @Prop({ type: Guest_Owner })
  guest_owner: Guest_Owner

  @Prop({ type: String, required: true })
  guest_refresh_token: string
}

export const GuestRestaurantSchema = SchemaFactory.createForClass(GuestRestaurant)
