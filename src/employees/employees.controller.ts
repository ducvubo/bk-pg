import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { EmployeesService } from './employees.service'
import { Acccount, ResponseMessage } from 'src/decorator/customize'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { IAccount } from 'src/accounts/accounts.interface'

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ResponseMessage('Tạo nhân viên thành công')
  @UseGuards(AccountAuthGuard)
  async create(@Body() createEmployeeDto: CreateEmployeeDto, @Acccount() account: IAccount) {
    return await this.employeesService.create(createEmployeeDto, account)
  }

  @Get()
  @ResponseMessage('Lấy danh sách nhân viên thành công')
  @UseGuards(AccountAuthGuard)
  async findAllPagination(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ) {
    return await this.employeesService.findAllPagination({ currentPage: +currentPage, limit: +limit, qs }, account)
  }
}
