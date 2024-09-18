import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { ImageUrl } from 'src/restaurants/model/restaurant.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type EmployeeDocument = HydratedDocument<Employee>

@Schema({ timestamps: true })
export class Employee extends SampleSchema {
  @Prop({ type: String, required: true })
  epl_name: string

  @Prop({ type: String, required: true })
  epl_email: string

  @Prop({ type: String, required: true })
  epl_password: string

  @Prop({ type: String, required: true })
  epl_phone: string

  @Prop({ type: String, required: true, enum: ['Khác', 'Nam', 'Nữ'], default: 'Khác' })
  epl_gender: string

  @Prop({ type: String })
  epl_address: string

  @Prop({ type: Object })
  epl_avatar: ImageUrl

  @Prop({ type: String, required: true, enums: ['enable', 'disable'], default: 'enable' })
  epl_status: string
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee)
