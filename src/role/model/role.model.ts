import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { SampleSchema } from 'src/utils/sample.schema'

export type RoleDocument = HydratedDocument<Role>

@Schema({ timestamps: true })
export class Role extends SampleSchema {
  @Prop({ type: String, required: true })
  rl_name: string

  @Prop({ type: String, required: true })
  rl_description: string

  @Prop({ type: String, required: true, enum: ['restaurant', 'user'], default: 'user' })
  rl_type: string

  @Prop({ type: Boolean, required: true, default: true })
  rl_isActive: boolean

  @Prop({ type: Array, required: true, default: [] })
  rl_permission: []
}

export const RoleSchema = SchemaFactory.createForClass(Role)
