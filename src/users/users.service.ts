import { ConflictException, Injectable } from '@nestjs/common'
import { UserRepository } from './model/user.repo'
import { RegisterUserDto } from './dto/register-user.dto'
import { createHash } from 'crypto'
import { decodeJwt, generateOtp, generateStrongPassword, isValidPassword } from 'src/utils'
import { deleteCacheIO, getCacheIO, setCacheIOExpiration } from 'src/utils/cache'
import { KEY_BLACK_LIST_TOKEN_USER, KEY_FORGOT_PASWORD, KEY_REGISTER } from 'src/constants/key.redis'
import { MailService } from 'src/mail/mail.service'
import { ComfirmUserDto } from './dto/comfirm-user.dto'
import { BadRequestError, NotFoundError, UnauthorizedCodeError, UnauthorizedError } from 'src/utils/errorResponse'
import { JwtService } from '@nestjs/jwt'
import * as crypto from 'crypto'
import { ConfigService } from '@nestjs/config'
import { getHashPassword } from 'src/utils/index'
import { RefreshTokenUserRepository } from './model/refresh-token.repo'

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenUserRepository: RefreshTokenUserRepository
  ) {}

  signToken = (_id: string, type: string) => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048
    })
    const token = this.jwtService.sign(
      { _id },
      {
        privateKey: privateKey,
        algorithm: 'RS256',
        expiresIn:
          type === 'refresh_token'
            ? this.configService.get<string>('JWT_REFRESH_US_EXPIRE')
            : this.configService.get<string>('JWT_ACCESS_US_EXPIRE')
      }
    )

    return {
      publicKey,
      token
    }
  }

  verifyToken = (token: string, publicKey: string) => {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: publicKey
      })
      return decoded
    } catch (error) {
      console.log(error)
      throw new UnauthorizedError('Token không hợp lệ')
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    const { us_email } = registerUserDto

    const userExist = await this.userRepository.findUserByEmail({ us_email })
    if (userExist) throw new ConflictException('Email này đã đăng ký')

    const us_password = generateStrongPassword(16)
    const hashPassword = getHashPassword(us_password)

    const otp = generateOtp()
    console.log('us_password: ', us_password)
    console.log('otp: ', otp)

    const otpHash = createHash('sha256').update(otp).digest('hex')
    const emailHash = createHash('sha256').update(us_email).digest('hex')
    Promise.all([
      await this.userRepository.registerUser({ us_email, us_password: hashPassword }),
      await setCacheIOExpiration(`${KEY_REGISTER}:${emailHash}`, otpHash, 600),
      await this.mailService.sendUserConfirmation(us_email, otp),
      await this.mailService.sendPassword(us_email, us_password)
    ])

    return null
  }

  async confirmEmail(comfirmUserDto: ComfirmUserDto) {
    const { otp, us_email } = comfirmUserDto

    const otpHash = createHash('sha256').update(otp).digest('hex')
    const emailHash = createHash('sha256').update(us_email).digest('hex')

    const cachedOtp = await getCacheIO(`${KEY_REGISTER}:${emailHash}`)

    if (!cachedOtp || cachedOtp !== otpHash) throw new BadRequestError('Mã OTP không đúng')

    if (cachedOtp === otpHash) {
      const user = await this.userRepository.verifyAccount({ us_email })

      if (!user) throw new UnauthorizedError('Đã có lỗi xảy ra vui lòng thử lại sau')

      await deleteCacheIO(`${KEY_REGISTER}:${emailHash}`)
      const token = await Promise.all([
        this.signToken(String(user._id), 'access_token'),
        this.signToken(String(user._id), 'refresh_token')
      ])

      const accessPublicKeyString = token[0].publicKey.export({ type: 'spki', format: 'pem' }).toString()
      const refreshPublicKeyString = token[1].publicKey.export({ type: 'spki', format: 'pem' }).toString()

      await this.refreshTokenUserRepository.create({
        rf_us_id: String(user._id),
        rf_refresh_token: token[1].token,
        rf_public_key_refresh_token: refreshPublicKeyString,
        rf_public_key_access_token: accessPublicKeyString
      })

      return {
        access_token: token[0].token,
        refresh_token: token[1].token
      }
    }
  }

  async findOneById({ _id }: { _id: string }) {
    return await this.userRepository.findOneById({ _id })
  }

  async login(loginUserDto) {
    const { us_email, us_password } = loginUserDto

    const user = await this.userRepository.findUserLoginByEmail({ us_email })
    if (!user) throw new UnauthorizedCodeError('Email hoặc password không đúng', -1)
    if (user.us_status === 'disable') throw new UnauthorizedCodeError('Tài khoản của bạn đã bị khóa', -2)
    if (user.us_verify === false) throw new UnauthorizedCodeError('Tài khoản chưa được kích hoạt', -3)

    if (!isValidPassword(us_password, user.us_password))
      throw new UnauthorizedCodeError('Email hoặc password không đúng', -1)

    const token = await Promise.all([
      this.signToken(String(user._id), 'access_token'),
      this.signToken(String(user._id), 'refresh_token')
    ])

    const accessPublicKeyString = token[0].publicKey.export({ type: 'spki', format: 'pem' }).toString()
    const refreshPublicKeyString = token[1].publicKey.export({ type: 'spki', format: 'pem' }).toString()

    await this.refreshTokenUserRepository.create({
      rf_us_id: String(user._id),
      rf_refresh_token: token[1].token,
      rf_public_key_refresh_token: refreshPublicKeyString,
      rf_public_key_access_token: accessPublicKeyString
    })

    return {
      access_token: token[0].token,
      refresh_token: token[1].token
    }
  }

  async findRefreshToken({ rf_refresh_token }: { rf_refresh_token: string }) {
    return await this.refreshTokenUserRepository.findOneByRefreshToken({ rf_refresh_token })
  }

  async refreshToken({ refresh_token }: { refresh_token: string }) {
    if (refresh_token) {
      const isBlackList = await getCacheIO(`${KEY_BLACK_LIST_TOKEN_USER}:${refresh_token}`)
      if (isBlackList) {
        const decodedJWT = decodeJwt(refresh_token)
        await this.refreshTokenUserRepository.logoutAll({ rf_us_id: decodedJWT._id })
        throw new UnauthorizedError('Token đã lỗi vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ 1')
      } else {
        try {
          const key = await this.refreshTokenUserRepository.findOneByRefreshToken({
            rf_refresh_token: refresh_token
          })

          if (!key) throw new UnauthorizedError('Token không hợp lệ 1')
          if (key) {
            const data_refresh_token = this.verifyToken(refresh_token, key.rf_public_key_refresh_token)
            const token = await Promise.all([
              this.signToken(String(data_refresh_token._id), 'access_token'),
              this.signToken(String(data_refresh_token._id), 'refresh_token')
            ])

            const accessPublicKeyString = token[0].publicKey.export({ type: 'spki', format: 'pem' }).toString()
            const refreshPublicKeyString = token[1].publicKey.export({ type: 'spki', format: 'pem' }).toString()

            Promise.all([
              await this.refreshTokenUserRepository.create({
                rf_us_id: data_refresh_token._id,
                rf_refresh_token: token[1].token,
                rf_public_key_refresh_token: refreshPublicKeyString,
                rf_public_key_access_token: accessPublicKeyString
              }),
              await setCacheIOExpiration(
                `${KEY_BLACK_LIST_TOKEN_USER}:${refresh_token}`,
                'hehehehehehehe',
                this.configService.get<string>('JWT_REFRESH_EXPIRE_REDIS')
              ),
              await this.refreshTokenUserRepository.deleteToken({
                rf_refresh_token: refresh_token,
                rf_us_id: data_refresh_token._id
              })
            ])

            return {
              access_token: token[0].token,
              refresh_token: token[1].token
            }
          }
        } catch (error) {
          console.log(error)
          throw new UnauthorizedError('Token lỗi vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ 2')
        }
      }
    } else {
      throw new UnauthorizedError('Không tìm thấy token ở header')
    }
  }

  async forgotPassword({ us_email }) {
    const user = await this.userRepository.findUserByEmail({ us_email })
    if (!user) throw new NotFoundError('Tài khoản không tồn tại')

    const otp = generateOtp()
    console.log(otp)
    const otpHash = createHash('sha256').update(otp).digest('hex')
    const emailHash = createHash('sha256').update(us_email).digest('hex')

    Promise.all([
      await setCacheIOExpiration(`${KEY_FORGOT_PASWORD}:${emailHash}`, otpHash, 600),
      await this.mailService.sendResetPassword(us_email, otp)
    ])

    return null
  }

  async changePassword(changePasswordDto) {
    const { us_email, us_password, otp } = changePasswordDto

    const otpHash = createHash('sha256').update(otp).digest('hex')
    const emailHash = createHash('sha256').update(us_email).digest('hex')
    const cacheOtp = await getCacheIO(`${KEY_FORGOT_PASWORD}:${emailHash}`)
    if (!cacheOtp || otpHash !== cacheOtp) throw new UnauthorizedError('Mã OTP không hợp lệ')
    const hashPassword = getHashPassword(us_password)

    await this.userRepository.changePassword({ us_email, us_password: hashPassword })

    return null
  }
}
