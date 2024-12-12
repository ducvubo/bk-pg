import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { TablesService } from './tables.service'
import { Acccount, ResponseMessage } from 'src/decorator/customize'
import { CreateTableDto } from './dto/create-table.dto'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateTableDto } from './dto/update-table.dto'
import { UpdateStatusTableDto } from './dto/update-status-table.dto'
import { TableDocument } from './model/tables.model'

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @ResponseMessage('Thêm bàn mới thành công')
  @UseGuards(AccountAuthGuard)
  async create(@Body() createTableDto: CreateTableDto, @Acccount() account: IAccount): Promise<TableDocument> {
    return await this.tablesService.create(createTableDto, account)
  }

  @Get()
  @ResponseMessage('Lấy danh sách bàn thành công')
  @UseGuards(AccountAuthGuard)
  async findAllPagination(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: TableDocument[]
  }> {
    return await this.tablesService.findAllPagination({ currentPage: +currentPage, limit: +limit, qs }, account)
  }

  @Patch()
  @ResponseMessage('Cập nhật thông tin bàn thành công')
  @UseGuards(AccountAuthGuard)
  async update(@Body() updateTableDto: UpdateTableDto, @Acccount() account: IAccount): Promise<TableDocument> {
    return await this.tablesService.update(updateTableDto, account)
  }

  @Get('/get-list-table-order')
  @ResponseMessage('Lấy danh sách bàn thành công')
  @UseGuards(AccountAuthGuard)
  async getListTableOrder(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: TableDocument[]
  }> {
    return await this.tablesService.getListTableOrder({ currentPage: +currentPage, limit: +limit, qs }, account)
  }

  @Get('/list-table-order')
  @ResponseMessage('Lấy danh sách bàn thành công')
  @UseGuards(AccountAuthGuard)
  async listTableOrder(@Acccount() account: IAccount): Promise<TableDocument[]> {
    return await this.tablesService.listTableOrder(account)
  }

  @Get('/recycle')
  @ResponseMessage('Lấy danh sách bàn đã xóa thành công')
  @UseGuards(AccountAuthGuard)
  async findAllRecycle(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: TableDocument[]
  }> {
    return await this.tablesService.findAllRecycle({ currentPage: +currentPage, limit: +limit, qs }, account)
  }

  @Patch('/update-status')
  @ResponseMessage('Cập nhật trạng thái bàn thành công')
  @UseGuards(AccountAuthGuard)
  async updateStatus(
    @Body() updateStatusTableDto: UpdateStatusTableDto,
    @Acccount() account: IAccount
  ): Promise<TableDocument> {
    return await this.tablesService.updateStatus(updateStatusTableDto, account)
  }

  @Patch('/update-token/:id')
  @ResponseMessage('Cập nhật mã qr bàn thành công')
  @UseGuards(AccountAuthGuard)
  async updateToken(@Param('id') id: string, @Acccount() account: IAccount): Promise<TableDocument> {
    return await this.tablesService.updateToken(id, account)
  }

  @Patch('/restore/:id')
  @ResponseMessage('Khôi phục bàn thành công')
  @UseGuards(AccountAuthGuard)
  async restore(@Param('id') id: string, @Acccount() account: IAccount): Promise<TableDocument> {
    return await this.tablesService.restore(id, account)
  }

  @Get('/:id')
  @ResponseMessage('Lấy thông tin bàn thành công')
  @UseGuards(AccountAuthGuard)
  async findOne(@Param('id') id: string, @Acccount() account: IAccount): Promise<TableDocument> {
    return await this.tablesService.findOne(id, account)
  }

  @Delete('/:id')
  @ResponseMessage('Xóa bàn thành công')
  @UseGuards(AccountAuthGuard)
  async remove(@Param('id') id: string, @Acccount() account: IAccount): Promise<TableDocument> {
    return await this.tablesService.remove(id, account)
  }
}
