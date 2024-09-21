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
import aqp from 'api-query-params'
import { UpdateUserDto } from './dto/update-user.dto'
import { IUser } from './users.interface'
import mongoose from 'mongoose'
import { UpdateStatusUser } from './dto/update-status.dto'
import { BookTableRepository } from 'src/book-table/model/book-table.repo'

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenUserRepository: RefreshTokenUserRepository,
    private readonly bookTableRepository: BookTableRepository
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

  async login(loginUserDto, id_user_guest_header) {
    const { us_email, us_password } = loginUserDto

    const user = await this.userRepository.findUserLoginByEmail({ us_email })
    if (!user) throw new UnauthorizedCodeError('Email hoặc password không đúng', -1)
    if (!isValidPassword(us_password, user.us_password))
      throw new UnauthorizedCodeError('Email hoặc password không đúng', -1)
    if (user.us_status === 'disable') throw new UnauthorizedCodeError('Tài khoản của bạn đã bị khóa', -2)
    if (user.us_verify === false) throw new UnauthorizedCodeError('Tài khoản chưa được kích hoạt', -3)
    if (user.isDeleted === true)
      throw new UnauthorizedCodeError('Tài khoản của bạn đã bị xóa, vui lòng liên hệ quản trị viên để được hỗ trợ', -4)

    const listBookTable = await this.bookTableRepository.findBookTableWithGuest(id_user_guest_header)

    listBookTable?.map(async (item) => {
      await this.bookTableRepository.updateBookTableGuestOfUser({ _id: item._id, book_tb_user_id: user._id })
    })
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
        throw new UnauthorizedCodeError('Token đã lỗi vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ 1', -10)
      } else {
        try {
          const key = await this.refreshTokenUserRepository.findOneByRefreshToken({
            rf_refresh_token: refresh_token
          })

          if (!key) throw new UnauthorizedCodeError('Token không hợp lệ 1', -10)
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
          throw new UnauthorizedCodeError('Token lỗi vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ 2', -10)
        }
      }
    } else {
      throw new UnauthorizedCodeError('Không tìm thấy token ở header', -10)
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

  async create(createUserDto, user) {
    const { us_email, us_password } = createUserDto

    const userExist = await this.userRepository.findUserByEmail({ us_email })
    if (userExist) throw new ConflictException('Email này đã đăng ký')

    const hashPassword = getHashPassword(us_password)
    const newUser = await this.userRepository.create({ ...createUserDto, us_password: hashPassword }, user)

    return {
      us_id: newUser._id,
      us_email: newUser.us_email
    }
  }

  async findAllUser({ currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string }) {
    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }
    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 8 : limit

    const { filter, sort } = aqp(qs)

    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10

    const totalItems = await this.userRepository.totalItems(false)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const population = ''

    const result = await this.userRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
      false
    )

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        totalPage: totalPages,
        totalItem: totalItems
      },
      result
    }
  }

  async findAllUserRecycle({ currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string }) {
    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }
    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 8 : limit

    const { filter, sort } = aqp(qs)

    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10

    const totalItems = await this.userRepository.totalItems(true)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const population = ''

    const result = await this.userRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
      true
    )

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        totalPage: totalPages,
        totalItem: totalItems
      },
      result
    }
  }

  async findOneUser({ _id }: { _id: string }) {
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Người dùng không tồn tại')
    const user = await this.userRepository.findOne({ _id })
    if (!user) throw new NotFoundError('Người dùng không tồn tại')
    return user
  }

  async updateUser(updateUserDto: UpdateUserDto, user: IUser) {
    const { _id } = updateUserDto
    const restaurantExist = await this.userRepository.findOne({ _id })

    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Người dùng không tồn tại')
    if (!restaurantExist) throw new NotFoundError('Người dùng không tồn tại')
    const updated = await this.userRepository.updateUser(updateUserDto, user)

    return {
      _id: updated._id,
      us_name: updated.us_name,
      us_email: updated.us_email,
      us_phone: updated.us_phone
    }
  }

  async removeUser({ _id }: { _id: string }, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Người dùng không tồn tại')

    const userExist = await this.userRepository.findOne({ _id })
    if (!userExist) throw new NotFoundError('Người dùng không tồn tại')

    const removed = await this.userRepository.removeUser({ _id }, user)
    return {
      _id: removed._id,
      us_name: removed.us_name,
      us_email: removed.us_email,
      us_phone: removed.us_phone
    }
  }

  async restore({ _id }, user: IUser) {
    if (!_id) throw new NotFoundError('Người dùng không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Người dùng không tồn tại')
    const userExist = await this.userRepository.findOne({ _id })
    if (!userExist) throw new NotFoundError('Người dùng không tồn tại')
    const restore = await this.userRepository.restore({ _id }, user)
    return {
      _id: restore._id,
      us_name: restore.us_name,
      us_email: restore.us_email,
      us_phone: restore.us_phone
    }
  }

  async updateStatus(updateStatusUser: UpdateStatusUser, user: IUser) {
    const { _id } = updateStatusUser
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Người dùng không tồn tại')
    const userExist = await this.userRepository.findOne({ _id })
    if (!userExist) throw new NotFoundError('Người dùng không tồn tại')
    const updated = await this.userRepository.updateStatus(updateStatusUser, user)
    return {
      _id: updated._id,
      us_name: updated.us_name,
      us_email: updated.us_email,
      us_phone: updated.us_phone,
      us_status: updated.us_status
    }
  }
}
