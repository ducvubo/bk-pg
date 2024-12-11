import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { EmployeesService } from './employees.service'
import { Acccount, ResponseMessage } from 'src/decorator/customize'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { UpdateStatusEmployeeDto } from './dto/update-status-employee.dto'
import { LoginEmployeeDto } from './dto/login-employee.dto'
import { EmployeeDocument } from './model/employees.model'

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ResponseMessage('Tạo nhân viên thành công')
  @UseGuards(AccountAuthGuard)
  async create(@Body() createEmployeeDto: CreateEmployeeDto, @Acccount() account: IAccount): Promise<EmployeeDocument> {
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
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: EmployeeDocument[]
  }> {
    return await this.employeesService.findAllPagination({ currentPage: +currentPage, limit: +limit, qs }, account)
  }

  @Patch()
  @ResponseMessage('Cập nhật thông tin nhân viên thành công')
  @UseGuards(AccountAuthGuard)
  async update(@Body() updateEmployeeDto: UpdateEmployeeDto, @Acccount() account: IAccount): Promise<EmployeeDocument> {
    return await this.employeesService.update(updateEmployeeDto, account)
  }

  @Get('/recycle')
  @ResponseMessage('Lấy danh sách nhân viên đã xóa thành công')
  @UseGuards(AccountAuthGuard)
  async findAllRecycle(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: EmployeeDocument[]
  }> {
    return await this.employeesService.findAllRecycle({ currentPage: +currentPage, limit: +limit, qs }, account)
  }

  @Patch('/restore/:id')
  @ResponseMessage('Khôi phục nhân viên thành công')
  @UseGuards(AccountAuthGuard)
  async restore(@Param('id') _id: string, @Acccount() account: IAccount): Promise<EmployeeDocument> {
    return await this.employeesService.restore({ _id, account })
  }

  @Patch('/update-status')
  @ResponseMessage('Cập nhật trạng thái nhân viên thành công')
  @UseGuards(AccountAuthGuard)
  async updateStatus(
    @Body() updateStatusEmployeeDto: UpdateStatusEmployeeDto,
    @Acccount() account: IAccount
  ): Promise<EmployeeDocument> {
    return await this.employeesService.updateStatus(updateStatusEmployeeDto, account)
  }

  @Post('/login')
  @ResponseMessage('Đăng nhập thành công')
  async login(
    @Body() loginEmployeeDto: LoginEmployeeDto
  ): Promise<{ access_token_epl: string; refresh_token_epl: string }> {
    return await this.employeesService.login(loginEmployeeDto)
  }

  @Post('/refresh-token')
  @ResponseMessage('Làm mới token thành công')
  async refreshToken(@Req() req: Request): Promise<{ access_token_epl: string; refresh_token_epl: string }> {
    const refresh_token = req.headers['authorization']?.split(' ')[1]
    return await this.employeesService.refreshToken({ refresh_token })
  }

  @Get('/infor')
  @ResponseMessage('Lấy thông tin nhân viên thành công')
  @UseGuards(AccountAuthGuard)
  async getInforEmployee(@Acccount() account: IAccount): Promise<EmployeeDocument> {
    return this.employeesService.getInforEmployee(account)
  }

  @Get('/:id')
  @ResponseMessage('Lấy thông tin nhân viên thành công')
  @UseGuards(AccountAuthGuard)
  async findOneById(@Param('id') _id: string, @Acccount() account: IAccount): Promise<EmployeeDocument> {
    return await this.employeesService.findOneById({ _id, account })
  }

  @Delete('/:id')
  @ResponseMessage('Xóa nhân viên thành công')
  @UseGuards(AccountAuthGuard)
  async delete(@Param('id') _id: string, @Acccount() account: IAccount): Promise<EmployeeDocument> {
    return await this.employeesService.delete({ _id, account })
  }
}
