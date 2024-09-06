import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { SampleSchema } from 'src/utils/sample.schema'

export type RefreshTokenUserDocument = HydratedDocument<RefreshTokenUser>

@Schema({ timestamps: true })
export class RefreshTokenUser extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: RefreshTokenUser.name, required: true })
  rf_us_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true })
  rf_refresh_token: string

  @Prop({ type: String, required: true })
  rf_public_key_refresh_token: string

  @Prop({ type: String, required: true })
  rf_public_key_access_token: string
}

export const RefreshTokenUserSchema = SchemaFactory.createForClass(RefreshTokenUser)
