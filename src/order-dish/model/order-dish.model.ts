import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Restaurant } from 'src/restaurants/model/restaurant.model'
import { SampleSchema } from 'src/utils/sample.schema'
import { DishDuplicate } from './dish-duplicate.model'
import { GuestRestaurant } from 'src/guest-restaurant/model/guest-restaurant.model'
import { Table } from 'src/tables/model/tables.model'

export type OrderDishDocument = HydratedDocument<OrderDish>

@Schema({ timestamps: true })
export class OrderDish extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name, required: true })
  od_dish_restaurant_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: GuestRestaurant.name, required: true })
  od_dish_guest_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Table.name, required: true })
  od_dish_table_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: DishDuplicate.name, required: true })
  od_dish_duplicate_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: Number, required: true })
  od_dish_quantity: number

  //'đang nấu, chờ xử lý, đã thanh toán, đã phục vụ, từ chối'
  @Prop({
    type: String,
    required: true,
    enums: ['processing', 'pending', 'paid', 'delivered', 'refuse'],
    default: 'pending'
  })
  od_dish_status: 'processing' | 'pending' | 'paid' | 'delivered' | 'refuse'
}

export const OrderDishSchema = SchemaFactory.createForClass(OrderDish)
