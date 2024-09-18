import { BadRequestException, Injectable } from '@nestjs/common'
import { BookTableRepository } from './model/book-table.repo'
import { CreateBookTableDto } from './dto/create-book-table.dto'
import { RestaurantRepository } from 'src/restaurants/model/restaurant.repo'
import { BadRequestError, NotFoundError } from 'src/utils/errorResponse'
import { JwtService } from '@nestjs/jwt'
import { MailService } from 'src/mail/mail.service'
import * as moment from 'moment'
import { dayOfWeekMap, daysOfWeekMapping } from './book-table.interface'
import 'dayjs/locale/vi' // Import ngôn ngữ tiếng Việt cho dayjs
import { ConfirmBookTableDto } from './dto/confirm-book-table.dto'
@Injectable()
export class BookTableService {
  constructor(
    private readonly bookTableRepository: BookTableRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  FormatDayOfWeek = (day_of_week: string) => {
    return day_of_week
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  getObjectByDayOfWeek = (dayOfWeek: any, restaurant_hours) => {
    // Tìm số thứ tự của ngày
    const dayNumber = dayOfWeekMap[dayOfWeek]

    // Tìm đối tượng trong mảng dữ liệu dựa trên số thứ tự
    const result = restaurant_hours.find((item) => dayOfWeekMap[item.day_of_week] === dayNumber)

    return result
  }

  async createBookTable(createBookTableDto: CreateBookTableDto, id_user_guest_header) {
    const {
      book_tb_restaurant_id,
      book_tb_guest_id,
      book_tb_redirect_url,
      book_tb_email,
      book_tb_phone,
      book_tb_name,
      book_tb_note,
      book_tb_date,
      book_tb_hour,
      book_tb_number_adults,
      book_tb_number_children
    } = createBookTableDto
    if (!book_tb_guest_id) {
      createBookTableDto.book_tb_guest_id = id_user_guest_header
    }
    const restaurantExist = await this.restaurantRepository.findOneByIdOfBook({
      id: book_tb_restaurant_id
    })
    if (!restaurantExist) throw new NotFoundError('Nhà hàng không tồn tại')

    const dayOfWeek = book_tb_date ? moment(book_tb_date).format('dddd') : null
    const dayOfWeekInVietnamese = dayOfWeek ? daysOfWeekMapping[dayOfWeek] : null
    const validDays = restaurantExist.restaurant_hours.map((item) => item.day_of_week)

    if (!validDays.includes(dayOfWeekInVietnamese)) throw new NotFoundError('Nhà hàng không mở cửa vào ngày này')

    const objectForDay = this.getObjectByDayOfWeek(dayOfWeekInVietnamese, restaurantExist.restaurant_hours)
    if (book_tb_hour.value < objectForDay.open || book_tb_hour.value > objectForDay.close) {
      throw new NotFoundError(
        `${objectForDay?.day_of_week} nhà hàng này không mở cửa vào khung giờ ${book_tb_hour.label}, vui lòng chuyển sang khung giờ khác`
      )
    }

    const newBookTable = await this.bookTableRepository.createBookTable(createBookTableDto)
    const updated = await this.bookTableRepository.createTokenVerify({
      _id: String(newBookTable._id),
      token_verify: this.jwtService.sign({ _id: newBookTable._id })
    })

    const url = `${book_tb_redirect_url}?token=${updated.book_tb_token_verify}`
    const formatDate = moment(book_tb_date).format('DD/MM/YYYY')
    await this.mailService.sendMailComfirmBookTable(
      book_tb_email,
      book_tb_phone,
      book_tb_name,
      restaurantExist.restaurant_name,
      book_tb_hour.label,
      formatDate,
      url,
      book_tb_number_adults,
      book_tb_number_children,
      book_tb_note
    )

    return null
    // const token_verify = this.jwtService.sign()
  }

  verifyToken(token: string) {
    try {
      const { _id } = this.jwtService.verify(token)
      console.log(_id)
      return _id
    } catch (error) {
      console.error('Error name:', error.name) // In ra tên lỗi để kiểm tra
      if (error.name === 'TokenExpiredError') {
        // Token hết hạn
        throw new BadRequestException(
          'Đơn đặt bàn đã quá thời gian xác nhận hoặc là bạn đã xác nhận, vui lòng kiểm tra lịch sử đặt bàn để biết thêm chi tiết'
        )
      } else if (error.name === 'JsonWebTokenError') {
        // Token không hợp lệ
        throw new BadRequestException('Xác nhận đơn đặt bàn không hợp lệ, vui lòng kiểm tra lại')
      } else {
        // Các lỗi khác
        throw new BadRequestException('Có lỗi xảy ra khi xác nhận đơn đặt bàn.')
      }
    }
  }

  async confirmBookTable(confirmBookTableDto: ConfirmBookTableDto) {
    const { book_tb_token_verify } = confirmBookTableDto
    const _id = this.verifyToken(book_tb_token_verify)
    const bookTableExists = await this.bookTableRepository.findBookTableById({ _id })

    if (!bookTableExists) throw new NotFoundError('Đơn đặt bàn không tồn tại')
    if (bookTableExists.book_tb_status === 'Hủy' || bookTableExists.book_tb_token_verify === '') {
      throw new BadRequestError(
        'Đơn đặt bàn đã bị hủy, vui lòng kiểm tra lại thông tin lịch sử đặt bàn để biết thâm chi tiết'
      )
    }
    return await this.bookTableRepository.confirmBookTable({ _id })
  }
}
