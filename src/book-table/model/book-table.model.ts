import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Restaurant } from 'src/restaurants/model/restaurant.model'
import { User } from 'src/users/model/user.model'
import { SampleSchema } from 'src/utils/sample.schema'

export type BookTableDocument = HydratedDocument<BookTable>

class Hour {
  @Prop({ type: String, required: true })
  label: string

  @Prop({ type: Number, required: true })
  value: number
}

class BookTableDetails {
  //status
  @Prop({
    type: String,
    enum: ['Chờ người đặt xác nhận', 'Chờ nhà hàng xác nhận', 'Nhà hàng đã tiếp nhận', 'Đã hoàn thành', 'Hủy'],
    required: true
  })
  book_tb_status: 'Chờ người đặt xác nhận' | 'Chờ nhà hàng xác nhận' | 'Nhà hàng đã tiếp nhận' | 'Đã hoàn thành' | 'Hủy'

  //thông tin chi tiết
  @Prop({ type: String })
  book_tb_details: string

  @Prop({ type: Date, default: new Date() })
  date_of_now: Date
}

@Schema({ timestamps: true })
export class BookTable extends SampleSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  book_tb_user_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String })
  book_tb_guest_id: string

  //nhà hàng
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name, required: true })
  book_tb_restaurant_id: mongoose.Schema.Types.ObjectId

  //email
  @Prop({ type: String, required: true })
  book_tb_email: string

  //sô điện thoại
  @Prop({ type: String, required: true })
  book_tb_phone: string

  //tên người đặt
  @Prop({ type: String, required: true })
  book_tb_name: string

  //ngày đặt
  @Prop({ type: Date, required: true })
  book_tb_date: Date

  //gi�� đặt
  @Prop({ type: Hour, required: true })
  book_tb_hour: Hour

  //số người lơn
  @Prop({ type: Number, required: true })
  book_tb_number_adults: number

  //số người tr�� em
  @Prop({ type: Number, required: true })
  book_tb_number_children: number

  //thông tin thêm
  @Prop({ type: String })
  book_tb_note: string

  //trạng thái
  @Prop({
    type: String,
    enum: ['Chờ người đặt xác nhận', 'Chờ nhà hàng xác nhận', 'Nhà hàng đã tiếp nhận', 'Đã hoàn thành', 'Hủy'],
    required: true
  })
  book_tb_status: 'Chờ người đặt xác nhận' | 'Chờ nhà hàng xác nhận' | 'Nhà hàng đã tiếp nhận' | 'Đã hoàn thành' | 'Hủy'

  //thông tin chi tiết đơn hàng
  @Prop({ type: Array, default: [] })
  book_tb_details: BookTableDetails[]

  //phản hồi của khách hàng
  @Prop({ type: String, default: '' })
  book_tb_feedback: string

  //số sao
  @Prop({ type: Number, enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })
  book_tb_star: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

  //token verify
  @Prop({ type: String })
  book_tb_token_verify: string
}

export const BookTableSchema = SchemaFactory.createForClass(BookTable)
