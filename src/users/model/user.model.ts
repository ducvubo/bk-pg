import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { ImageUrl } from 'src/restaurants/model/restaurant.model'
import { Role } from 'src/role/model/role.model'
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

  @Prop({ type: String, required: true, enum: ['Khác', 'Nam', 'Nữ'], default: 'Khác' })
  us_gender: string

  @Prop({ type: String })
  us_address: string

  @Prop({ type: Object })
  us_avatar: ImageUrl

  @Prop({ type: Boolean, required: true, default: false })
  us_verify: boolean

  @Prop({ type: String, required: true, enums: ['enable', 'disable'], default: 'enable' })
  us_status: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Role.name,
    required: true,
    default: '66dd1d0a56f4696b95232d61'
  })
  us_role: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, default: 'local' })
  us_type: string
}

export const UserSchema = SchemaFactory.createForClass(User)
