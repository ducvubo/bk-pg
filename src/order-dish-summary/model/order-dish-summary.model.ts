import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Restaurant } from 'src/restaurants/model/restaurant.model'
import { SampleSchema } from 'src/utils/sample.schema'
import { GuestRestaurant } from 'src/guest-restaurant/model/guest-restaurant.model'
import { Table } from 'src/tables/model/tables.model'

export type OrderDishSummaryDocument = HydratedDocument<OrderDishSummary>

@Schema({ timestamps: true })
export class OrderDishSummary extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name, required: true })
  od_dish_smr_restaurant_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: GuestRestaurant.name, required: true })
  od_dish_smr_guest_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Table.name, required: true })
  od_dish_smr_table_id: mongoose.Schema.Types.ObjectId

  //đã thanh toán,  từ chối', đang order
  @Prop({
    type: String,
    required: true,
    enums: ['paid', 'refuse', 'ordering']
  })
  od_dish_smr_status: 'paid' | 'refuse' | 'ordering'
}

export const OrderDishSummarySchema = SchemaFactory.createForClass(OrderDishSummary)
