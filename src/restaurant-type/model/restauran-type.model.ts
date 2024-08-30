import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { SampleSchema } from 'src/utils/sample.schema'
// import { Role } from 'src/roles/schemas/role.schema'

export type RestaurantTypeDocument = HydratedDocument<RestaurantType>

@Schema({ timestamps: true })
export class RestaurantType extends SampleSchema {
  // Tên tiện ích
  @Prop({ type: String, required: true })
  restaurant_type_name: string
}

export const RestaurantTypeSchema = SchemaFactory.createForClass(RestaurantType)
