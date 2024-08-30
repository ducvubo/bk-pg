import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { SampleSchema } from 'src/utils/sample.schema'
// import { Role } from 'src/roles/schemas/role.schema'

export type AmenityDocument = HydratedDocument<Amenity>

@Schema({ timestamps: true })
export class Amenity extends SampleSchema {
  // Tên tiện ích
  @Prop({ type: String, required: true })
  amenity_name: string
}

export const AmenitySchema = SchemaFactory.createForClass(Amenity)
