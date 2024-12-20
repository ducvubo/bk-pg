import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BookTable, BookTableDocument } from './book-table.model'
import { CreateBookTableDto } from '../dto/create-book-table.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateStatusBookTableDto } from '../dto/update-status-book-table.dto'

@Injectable()
export class BookTableRepository {
  constructor(@InjectModel(BookTable.name) private bookTableModel: Model<BookTableDocument>) {}

  async createBookTable(createBookTableDto: CreateBookTableDto): Promise<BookTableDocument> {
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

  async createTokenVerify({ _id, token_verify }: { _id: string; token_verify: string }): Promise<BookTableDocument> {
    return await this.bookTableModel.findByIdAndUpdate(_id, { book_tb_token_verify: token_verify }, { new: true })
  }

  async findBookTableNoVerify(): Promise<BookTableDocument[]> {
    return await this.bookTableModel.find({ book_tb_status: 'Chờ người đặt xác nhận' }).lean().select('createdAt _id')
  }

  async updateCancelBookTable({ _id }): Promise<BookTableDocument> {
    return (await this.bookTableModel
      .findByIdAndUpdate(
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
      .lean()) as BookTableDocument
  }

  async findBookTableById({ _id }: { _id: string }): Promise<BookTableDocument> {
    return (await this.bookTableModel.findOne({ _id }).lean()) as BookTableDocument
  }

  async confirmBookTable({ _id }: { _id: string }): Promise<BookTableDocument> {
    return (await this.bookTableModel
      .findByIdAndUpdate(
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
      .lean()) as BookTableDocument
  }

  async findBookTableWithGuest(book_tb_guest_id: string): Promise<BookTableDocument[]> {
    return await this.bookTableModel.find({ book_tb_guest_id })
  }

  async updateBookTableGuestOfUser({ _id, book_tb_user_id }): Promise<BookTableDocument> {
    return (await this.bookTableModel
      .findByIdAndUpdate(_id, { book_tb_user_id }, { new: true })
      .lean()) as BookTableDocument
  }

  async totalItemsBooTableRestaurant(filter: any, account: IAccount): Promise<number> {
    const toDate = new Date(filter.toDate) // Chuyển đổi thành Date
    const fromDate = new Date(filter.fromDate)
    return await this.bookTableModel
      .countDocuments({
        book_tb_restaurant_id: account.account_restaurant_id,
        book_tb_date: {
          $gte: toDate,
          $lte: fromDate
        }
      })
      .lean()
  }

  async findPaginationBooTableRestaurant(
    { offset, defaultLimit, sort, filter },
    account: IAccount
  ): Promise<BookTableDocument[]> {
    const toDate = new Date(filter.toDate) // Chuyển đổi thành Date
    const fromDate = new Date(filter.fromDate)
    return await this.bookTableModel
      .find({
        book_tb_restaurant_id: account.account_restaurant_id,
        book_tb_date: {
          $gte: toDate,
          $lte: fromDate
        }
      })
      .select(' -__v')
      .skip(offset)
      .limit(defaultLimit)
      .sort({ updatedAt: -1, ...sort })
      .exec()
  }

  async findOneById({ _id }: { _id: string }): Promise<BookTableDocument> {
    return (await this.bookTableModel.findOne({ _id }).lean()) as BookTableDocument
  }

  async updateStatusBookTable(
    updateStatusBookTableDto: UpdateStatusBookTableDto,
    account: IAccount
  ): Promise<BookTableDocument> {
    const { _id, book_tb_status } = updateStatusBookTableDto
    return (await this.bookTableModel
      .findByIdAndUpdate(
        _id,
        {
          book_tb_status,
          updatedBy: {
            _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
            email: account.account_email
          }
        },
        { new: true }
      )
      .lean()) as BookTableDocument
  }
}
