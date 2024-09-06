import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { SampleSchema } from 'src/utils/sample.schema'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User extends SampleSchema {
  @Prop({ type: String, required: true })
  us_name: string

  @Prop({ type: String, required: true })
  us_email: string

  @Prop({ type: String, required: true })
  us_password: string

  @Prop({ type: String, required: true })
  us_phone: string

  @Prop({ type: String, required: true })
  us_address: string

  @Prop({ type: Boolean, required: true, default: false })
  us_verify: boolean

  @Prop({ type: String, required: true, enums: ['enable', 'disable'], default: 'enable' })
  us_status: string

  @Prop({ type: String, required: true, enum: ['user', 'admin'], default: 'user' })
  us_role: string

  @Prop({ type: String, required: true, default: 'local' })
  us_type: string
}

export const UserSchema = SchemaFactory.createForClass(User)
