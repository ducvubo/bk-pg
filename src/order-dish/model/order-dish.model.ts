import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { SampleSchema } from 'src/utils/sample.schema'
import { DishDuplicate } from './dish-duplicate.model'
import { GuestRestaurant } from 'src/guest-restaurant/model/guest-restaurant.model'
import { OrderDishSummary } from 'src/order-dish-summary/model/order-dish-summary.model'

export type OrderDishDocument = HydratedDocument<OrderDish>

@Schema({ timestamps: true })
export class OrderDish extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: OrderDishSummary.name, required: true })
  od_dish_summary_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: GuestRestaurant.name, required: true })
  od_dish_guest_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: DishDuplicate.name, required: true })
  od_dish_duplicate_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: Number, required: true })
  od_dish_quantity: number

  //'đang nấu, chờ xử lý, đã phục vụ, từ chối'
  @Prop({
    type: String,
    required: true,
    enums: ['processing', 'pending', 'delivered', 'refuse'],
    default: 'pending'
  })
  od_dish_status: 'processing' | 'pending' | 'delivered' | 'refuse'
}

export const OrderDishSchema = SchemaFactory.createForClass(OrderDish)
