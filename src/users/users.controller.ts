import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { ResponseMessage, User } from 'src/decorator/customize'
import { RegisterUserDto } from './dto/register-user.dto'
import { ComfirmUserDto } from './dto/comfirm-user.dto'
import { generateStrongPassword } from 'src/utils'
import { UserAuthGuard } from 'src/guard/users.guard'
import { IUser } from './users.interface'
import { LoginUserDto } from './dto/login-user.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  @ResponseMessage('Đăng ký tài khoản thành công, vui lòng xác nhận trong email')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.usersService.register(registerUserDto)
  }

  @Post('/login')
  @ResponseMessage('Đăng nhập thành công')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.usersService.login(loginUserDto)
  }

  @Post('/comfirm')
  @ResponseMessage('Xác nhận tài khoản thành công')
  async comfirmEmail(@Body() comfirmUserDto: ComfirmUserDto) {
    return await this.usersService.confirmEmail(comfirmUserDto)
  }

  @Get('/me')
  @UseGuards(UserAuthGuard)
  @ResponseMessage('Lấy thông tin tài khoản thành công')
  async getMe(@User() user: IUser) {
    return user
  }

  @Post('refresh-token')
  @ResponseMessage('Làm mới token thành công')
  async refreshToken(@Req() req: Request) {
    const refresh_token = req.headers['authorization']?.split(' ')[1]
    return await this.usersService.refreshToken({ refresh_token })
  }

  @Get()
  @ResponseMessage('Lấy tất cả tài khoản thành công')
  async test() {
    return {
      password: generateStrongPassword(16)
    }
  }
}
