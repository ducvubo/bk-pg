import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { ResponseMessage, User } from 'src/decorator/customize'
import { RegisterUserDto } from './dto/register-user.dto'
import { ComfirmUserDto } from './dto/comfirm-user.dto'
import { UserAuthGuard } from 'src/guard/users.guard'
import { IUser } from './users.interface'
import { LoginUserDto } from './dto/login-user.dto'
import { ChangePasswordDto, ForgotPasswordDto } from './dto/change-password.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UpdateStatusUser } from './dto/update-status.dto'
import { UserDocument } from './model/user.model'
// import { generateStrongPassword } from 'src/utils'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // @Get()
  // @ResponseMessage('Lấy tất cả tài khoản thành công')
  // async test(@Req() req: Request) {
  //   console.log(req.headers['id_user_guest'])
  //   return {
  //     password: generateStrongPassword(16)
  //   }
  // }
  @Post()
  @ResponseMessage('Tạo người dùng mới thành công')
  @UseGuards(UserAuthGuard)
  async create(
    @Body() createUserDto: CreateUserDto,
    @User() user: IUser
  ): Promise<{ us_id: string; us_email: string }> {
    return await this.usersService.create(createUserDto, user)
  }

  @Get()
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Lấy tất cả người dùng thành công')
  async findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: UserDocument[]
  }> {
    return await this.usersService.findAllUser({ currentPage: +currentPage, limit: +limit, qs })
  }

  @Patch()
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Cập nhật thông tin người dùng thành công')
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser
  ): Promise<{
    _id: string
    us_name: string
    us_email: string
    us_phone: string
  }> {
    return await this.usersService.updateUser(updateUserDto, user)
  }

  @Get('/recycle')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Lấy tất cả người dùng đã xóa thành công')
  async findAllRecycle(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: UserDocument[]
  }> {
    return await this.usersService.findAllUserRecycle({ currentPage: +currentPage, limit: +limit, qs })
  }

  @Post('/register')
  @ResponseMessage('Đăng ký tài khoản thành công, vui lòng xác nhận trong email')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<{ us_email: string }> {
    return await this.usersService.register(registerUserDto)
  }

  @Post('/login')
  @ResponseMessage('Đăng nhập thành công')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: Request
  ): Promise<{ access_token: string; refresh_token: string }> {
    const id_user_guest_header = req.headers['id_user_guest']
    return await this.usersService.login(loginUserDto, id_user_guest_header)
  }

  @Post('/verify')
  @ResponseMessage('Xác nhận tài khoản thành công')
  async comfirmEmail(@Body() comfirmUserDto: ComfirmUserDto): Promise<{ access_token: string; refresh_token: string }> {
    return await this.usersService.confirmEmail(comfirmUserDto)
  }

  @Get('/me')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Lấy thông tin tài khoản thành công')
  async getMe(@User() user: IUser): Promise<IUser> {
    return user
  }

  @Post('refresh-token')
  @ResponseMessage('Làm mới token thành công')
  async refreshToken(@Req() req: Request): Promise<{ access_token: string; refresh_token: string }> {
    const refresh_token = req.headers['authorization']?.split(' ')[1]
    return await this.usersService.refreshToken({ refresh_token })
  }

  @Post('/change-password')
  @ResponseMessage('Đ��i mật khẩu thành công')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto): Promise<null> {
    return await this.usersService.changePassword(changePasswordDto)
  }

  @Post('/forgot-password')
  @ResponseMessage('Quên mật khẩu thành công, vui lòng kiểm tra email')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<null> {
    return await this.usersService.forgotPassword({ us_email: forgotPasswordDto.us_email })
  }

  @Patch('/status')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Cập nhật trạng thái hoạt động của người dùng thành công')
  async updateStatus(
    @Body() updateStatusUser: UpdateStatusUser,
    @User() user: IUser
  ): Promise<{
    _id: string
    us_name: string
    us_email: string
    us_phone: string
    us_status: string
  }> {
    return await this.usersService.updateStatus(updateStatusUser, user)
  }

  @Patch('/restore/:id')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Khôi phục người dùng đã xóa thành công')
  async restore(
    @Param('id') _id: string,
    @User() user: IUser
  ): Promise<{
    _id: string
    us_name: string
    us_email: string
    us_phone: string
  }> {
    return await this.usersService.restore({ _id }, user)
  }

  @Get('/:id')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Lấy thông tin tài khoản theo ID thành công')
  async findOne(@Param('id') id: string): Promise<UserDocument> {
    return await this.usersService.findOneUser({ _id: id })
  }

  @Delete('/:id')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Xóa người dùng thành công')
  async remove(
    @Param('id') id: string,
    @User() user: IUser
  ): Promise<{
    _id: string
    us_name: string
    us_email: string
    us_phone: string
  }> {
    return await this.usersService.removeUser({ _id: id }, user)
  }
}
