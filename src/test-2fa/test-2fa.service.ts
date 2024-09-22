import { Injectable } from '@nestjs/common'
import * as speakeasy from 'speakeasy'
import * as qrcode from 'qrcode'
@Injectable()
export class Test2faService {
  generateSecret() {
    const secret = speakeasy.generateSecret({
      name: 'YourApp', // Tên ứng dụng của bạn
      length: 20 // Độ dài secret key
    })
    return secret // Đây là đối tượng secret đầy đủ chứa nhiều thông tin
  }

  // Tạo mã QR từ secret key để người dùng quét
  async generateQrCode(secret: speakeasy.GeneratedSecret) {
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32, // Sử dụng secret.base32 từ đối tượng secret
      label: 'YourAppName:username', // Thông tin người dùng
      issuer: 'YourAppName' // Tên ứng dụng
    }) 

    // Sinh mã QR từ OTP Auth URL
    const qrCodeImageUrl = await qrcode.toDataURL(otpAuthUrl)
    return qrCodeImageUrl // Trả về URL của mã QR
  }

  verifyToken(secret: string, token: string): boolean {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Thời gian lệch 30 giây 
    })

    console.log(verified)

    return verified
  }
}
