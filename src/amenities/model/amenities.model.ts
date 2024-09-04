import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type AmenityDocument = HydratedDocument<Amenity>

@Schema({ timestamps: true })
export class Amenity {
  // Tên tiện ích
  @Prop({ type: String, required: true })
  amenity_name: string
}

export const AmenitySchema = SchemaFactory.createForClass(Amenity)
