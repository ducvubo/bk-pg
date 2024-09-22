import { Body, Controller, Get, Post, Res } from '@nestjs/common'
import { Test2faService } from './test-2fa.service'
import { setCacheIO } from 'src/utils/cache'
import { ResponseMessage } from 'src/decorator/customize'
import * as speakeasy from 'speakeasy'

@Controller('test-2fa')
export class Test2faController {
  constructor(private readonly test2faService: Test2faService) {}
  @Get('generate')
  @ResponseMessage('Generate QR code success')
  async generateQrCode(@Res() res) {
    const secret = this.test2faService.generateSecret()
    const qrCodeUrl = await this.test2faService.generateQrCode(secret)

    // Lưu secret vào cơ sở dữ liệu cho người dùng nếu cần thiết
    // Ví dụ: user.secret = secret.base32;

    await setCacheIO(secret.base32, secret.base32) // Lưu secret vào cache trong 5 phút

    return res.json({
      qrCodeUrl,
      secret: secret.base32 // Trả về secret key để xác thực mã OTP sau này
    })
  }

  @Post('verify')
  @ResponseMessage('Verify OTP success')
  verifyOtp(@Body() body, @Res() res) {
    const { secret, token } = body // secret lấy từ cơ sở dữ liệu của người dùng
    console.log({ secret, token })

    const generatedToken = speakeasy.totp({
      secret: 'ENCVGXSOG5PFOPRJIVEDUMDGOUZXSNJ6', // Sử dụng secret này
      encoding: 'base32'
    })
    console.log('secret', secret)
    console.log('Generated Token:', generatedToken)
    console.log('User input token:', token)
    const isValid = this.test2faService.verifyToken(secret, generatedToken)

    if (isValid) {
      return res.status(200).json({ message: 'OTP is valid' })
    } else {
      return res.status(401).json({ message: 'Invalid OTP' })
    }
  }
}
