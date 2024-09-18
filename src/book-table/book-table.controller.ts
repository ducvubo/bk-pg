import { Body, Controller, Patch, Post, Req } from '@nestjs/common'
import { BookTableService } from './book-table.service'
import { ResponseMessage } from 'src/decorator/customize'
import { CreateBookTableDto } from './dto/create-book-table.dto'
import { Request } from 'express'
import { ConfirmBookTableDto } from './dto/confirm-book-table.dto'

@Controller('book-table')
export class BookTableController {
  constructor(private readonly bookTableService: BookTableService) {}

  @Post()
  @ResponseMessage('Đặt bàn thành công, vui lòng xác nhận thông tin trong email')
  async createBookTable(@Body() createBookTableDto: CreateBookTableDto, @Req() req: Request) {
    const id_user_guest_header = req.headers['id_user_guest']
    return await this.bookTableService.createBookTable(createBookTableDto, id_user_guest_header)
  }

  @Patch('/user-confirm')
  @ResponseMessage('Xác nhận đặt bàn thành công')
  async confirmBookTable(@Body() confirmBookTableDto: ConfirmBookTableDto) {
    return await this.bookTableService.confirmBookTable(confirmBookTableDto)
  }
}
