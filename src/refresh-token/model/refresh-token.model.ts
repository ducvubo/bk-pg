import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { SampleSchema } from 'src/utils/sample.schema'

export type RefreshTokenCPAndEPLDocument = HydratedDocument<RefreshTokenCPAndEPL>

// bảng refresh token của nhà hàng và nhân viên
@Schema({ timestamps: true })
export class RefreshTokenCPAndEPL extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  rf_cp_epl_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, enum: ['restaurant', 'employee'] })
  rf_type: 'restaurant' | 'employee'

  @Prop({ type: String, required: true })
  rf_refresh_token: string

  @Prop({ type: String, required: true })
  rf_public_key_refresh_token: string

  @Prop({ type: String, required: true })
  rf_public_key_access_token: string
}

export const RefreshTokenCPAndEPLSchema = SchemaFactory.createForClass(RefreshTokenCPAndEPL)
