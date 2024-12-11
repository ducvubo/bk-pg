import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { BookTableService } from './book-table.service'
import { Acccount, ResponseMessage } from 'src/decorator/customize'
import { CreateBookTableDto } from './dto/create-book-table.dto'
import { Request } from 'express'
import { ConfirmBookTableDto } from './dto/confirm-book-table.dto'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateStatusBookTableDto } from './dto/update-status-book-table.dto'
import { BookTableDocument } from './model/book-table.model'

@Controller('book-table')
export class BookTableController {
  constructor(private readonly bookTableService: BookTableService) {}

  @Post()
  @ResponseMessage('Đặt bàn thành công, vui lòng xác nhận thông tin trong email')
  async createBookTable(
    @Body() createBookTableDto: CreateBookTableDto,
    @Req() req: Request
  ): Promise<BookTableDocument> {
    const id_user_guest_header = req.headers['id_user_guest']
    return await this.bookTableService.createBookTable(createBookTableDto, id_user_guest_header.toString())
  }

  @Patch('/user-confirm')
  @ResponseMessage('Xác nhận đặt bàn thành công')
  async confirmBookTable(@Body() confirmBookTableDto: ConfirmBookTableDto): Promise<BookTableDocument> {
    return await this.bookTableService.confirmBookTable(confirmBookTableDto)
  }

  @Get('/list-book-table-restaurant')
  @ResponseMessage('Lấy danh sách đặt bàn thành công')
  @UseGuards(AccountAuthGuard)
  async listBookTableRestaurant(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: BookTableDocument[]
  }> {
    return await this.bookTableService.listBookTableRestaurant(
      { currentPage: +currentPage, limit: +limit, qs },
      account
    )
  }

  @Patch('/update-status')
  @ResponseMessage('Cập nhật trạng thái đặt bàn thành công')
  @UseGuards(AccountAuthGuard)
  async updateStatusBookTable(
    @Body() updateStatusBookTableDto: UpdateStatusBookTableDto,
    @Acccount() account: IAccount
  ): Promise<BookTableDocument> {
    return await this.bookTableService.updateStatusBookTable(updateStatusBookTableDto, account)
  }
}
