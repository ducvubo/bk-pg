import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { GuestRestaurantService } from './guest-restaurant.service'
import { GuestRestaurant, ResponseMessage } from 'src/decorator/customize'
import { LoginGuestRestaurantDto } from './dto/login-guest.dto'
import { GuestRestaurantAuthGuard } from 'src/guard/guest.guard'
import { IGuest } from './guest.interface'
import { AddMemberDto } from './dto/add-member.dto'
import { AccountAuthGuard } from 'src/guard/accounts.guard'

@Controller('guest-restaurant')
export class GuestRestaurantController {
  constructor(private readonly guestRestaurantService: GuestRestaurantService) {}

  @Post('/login')
  @ResponseMessage('Đăng nhập thành công')
  async loginGuestRestaurant(@Body() LoginGuestRestaurantDto: LoginGuestRestaurantDto) {
    return this.guestRestaurantService.loginGuestRestaurant(LoginGuestRestaurantDto)
  }

  @Post('/refresh-token')
  @ResponseMessage('Refresh token thành công')
  async refreshToken(@Req() req: any) {
    const refresh_token = req.headers['authorization']?.split(' ')[1]
    return this.guestRestaurantService.refreshToken(refresh_token)
  }

  @Get('/infor')
  @ResponseMessage('Lấy thông tin guest thành công')
  @UseGuards(GuestRestaurantAuthGuard)
  async me(@GuestRestaurant() guest: IGuest) {
    return guest
  }

  @Post('/generate-token-add-member')
  @ResponseMessage('Tạo token thành công')
  @UseGuards(GuestRestaurantAuthGuard)
  async generateTokenAddMember(@GuestRestaurant() guest: IGuest) {
    return this.guestRestaurantService.generateTokenAddMember(guest)
  }

  @Post('/add-member')
  @ResponseMessage('Thêm thành viên vào thành công')
  async addMember(@Body() addMemberDto: AddMemberDto) {
    return this.guestRestaurantService.addMember(addMemberDto)
  }

  @Post('/get-token')
  @ResponseMessage('Lấy token thành công')
  @UseGuards(AccountAuthGuard)
  async getToken(@Body('_id') _id: string) {
    return this.guestRestaurantService.getToken({ _id })
  }
}
