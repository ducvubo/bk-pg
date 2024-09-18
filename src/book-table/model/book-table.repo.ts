import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BookTable, BookTableDocument } from './book-table.model'
import { CreateBookTableDto } from '../dto/create-book-table.dto'

@Injectable()
export class BookTableRepository {
  constructor(@InjectModel(BookTable.name) private bookTableModel: Model<BookTableDocument>) {}

  async createBookTable(createBookTableDto: CreateBookTableDto) {
    const {
      book_tb_user_id,
      book_tb_guest_id,
      book_tb_restaurant_id,
      book_tb_email,
      book_tb_phone,
      book_tb_name,
      book_tb_date,
      book_tb_hour,
      book_tb_number_adults,
      book_tb_number_children,
      book_tb_note
    } = createBookTableDto
    return await this.bookTableModel.create({
      book_tb_user_id,
      book_tb_guest_id,
      book_tb_restaurant_id,
      book_tb_email,
      book_tb_phone,
      book_tb_name,
      book_tb_date,
      book_tb_hour,
      book_tb_number_adults,
      book_tb_number_children,
      book_tb_note,
      book_tb_status: 'Chờ người đặt xác nhận',
      book_tb_details: [
        {
          book_tb_status: 'Chờ người đặt xác nhận',
          book_tb_details: 'Chờ xác nhận',
          date_of_now: new Date()
        }
      ]
    })
  }

  async createTokenVerify({ _id, token_verify }: { _id: string; token_verify: string }) {
    return await this.bookTableModel.findByIdAndUpdate(_id, { book_tb_token_verify: token_verify }, { new: true })
  }

  async findBookTableNoVerify() {
    return await this.bookTableModel.find({ book_tb_status: 'Chờ người đặt xác nhận' }).lean().select('createdAt _id')
  }

  async updateCancelBookTable({ _id }) {
    return await this.bookTableModel.findByIdAndUpdate(
      _id,
      {
        book_tb_status: 'Hủy',
        book_tb_token_verify: '',
        $push: {
          book_tb_details: {
            book_tb_status: 'Hủy',
            book_tb_details: 'PASSGO không liên lạc được với bạn',
            date_of_now: new Date()
          }
        }
      },
      { new: true }
    )
  }

  async findBookTableById({ _id }: { _id: string }) {
    return await this.bookTableModel.findOne({ _id }).lean()
  }

  async confirmBookTable({ _id }: { _id: string }) {
    return await this.bookTableModel.findByIdAndUpdate(
      _id,
      {
        book_tb_status: 'Chờ nhà hàng xác nhận',
        book_tb_token_verify: '',
        $push: {
          book_tb_details: {
            book_tb_status: 'Chờ nhà hàng xác nhận',
            book_tb_details: 'PASSGO đã nhận đơn hàng của bạn',
            date_of_now: new Date()
          }
        }
      },
      { new: true }
    )
  }

  async findBookTableWithGuest(book_tb_guest_id) {
    return await this.bookTableModel.find({ book_tb_guest_id }).lean()
  }

  async updateBookTableGuestOfUser({ _id, book_tb_user_id }) {
    return await this.bookTableModel.findByIdAndUpdate(_id, { book_tb_user_id }, { new: true })
  }
}
