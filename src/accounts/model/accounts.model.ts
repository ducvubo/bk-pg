import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Employee } from 'src/employees/model/employees.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type AccountsDocument = HydratedDocument<Accounts>

@Schema({ timestamps: true })
export class Accounts extends SampleSchema {
  @Prop({ type: String, required: true })
  account_email: string

  @Prop({ type: String, required: true })
  account_password: string

  @Prop({ type: String, required: true, enum: ['restaurant', 'employee'] })
  account_type: 'restaurant' | 'employee'

  @Prop({ type: String, required: true, default: 'test' })
  account_role: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  account_restaurant_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  account_employee_id: mongoose.Schema.Types.ObjectId
}

export const AccountsSchema = SchemaFactory.createForClass(Accounts)
