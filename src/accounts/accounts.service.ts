import { Injectable } from '@nestjs/common'
import { AccountRepository } from './model/accounts.repo'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokenAccountRepository } from './model/refresh-token.repo'
import { ConfigService } from '@nestjs/config'
import { UnauthorizedError } from 'src/utils/errorResponse'
import * as crypto from 'crypto'
import { getHashPassword } from 'src/utils'

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly refreshTokenAccountRepository: RefreshTokenAccountRepository,
    private jwtService: JwtService,
    private readonly configService: ConfigService
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
            ? this.configService.get<string>('JWT_REFRESH_CP_EPL_EXPIRE')
            : this.configService.get<string>('JWT_ACCESS_CP_EPL_EXPIRE')
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

  async createAccount({
    account_email,
    account_password,
    account_type,
    account_restaurant_id,
    account_employee_id
  }: {
    account_email: string
    account_password: string
    account_type: 'restaurant' | 'employee'
    account_restaurant_id: string
    account_employee_id?: string
  }) {
    return await this.accountRepository.createAccount({
      account_email,
      account_password: getHashPassword(account_password),
      account_type,
      account_restaurant_id,
      account_employee_id
    })
  }

  async findAccountByIdRestaurant({ account_restaurant_id }: { account_restaurant_id: string }) {
    return await this.accountRepository.findAccountByIdRestaurant({ account_restaurant_id })
  }

  async findAccountByIdEmployee({ account_employee_id, account_restaurant_id }) {
    return await this.accountRepository.findAccountByIdEmployee({ account_employee_id, account_restaurant_id })
  }

  async generateRefreshTokenCP({ _id }: { _id: string }) {
    const token = await Promise.all([
      this.signToken(String(_id), 'access_token'),
      this.signToken(String(_id), 'refresh_token')
    ])

    const accessPublicKeyString = token[0].publicKey.export({ type: 'spki', format: 'pem' }).toString()
    const refreshPublicKeyString = token[1].publicKey.export({ type: 'spki', format: 'pem' }).toString()

    await this.refreshTokenAccountRepository.createToken({
      rf_cp_epl_id: _id,
      rf_refresh_token: token[1].token,
      rf_public_key_refresh_token: refreshPublicKeyString,
      rf_public_key_access_token: accessPublicKeyString
    })

    return {
      access_token_rtr: token[0].token,
      refresh_token_rtr: token[1].token
    }
  }

  async findAccoutById({ _id }: { _id: string }) {
    return await this.accountRepository.findAccoutById({ _id })
  }

  async findRefreshToken({ rf_refresh_token }: { rf_refresh_token: string }) {
    return await this.refreshTokenAccountRepository.findRefreshToken({ rf_refresh_token })
  }

  async logoutAll({ rf_cp_epl_id }: { rf_cp_epl_id: string }) {
    return await this.refreshTokenAccountRepository.logoutAll({ rf_cp_epl_id })
  }

  async deleteToken({ rf_refresh_token, rf_cp_epl_id }: { rf_refresh_token: string; rf_cp_epl_id: string }) {
    return await this.refreshTokenAccountRepository.deleteToken({ rf_refresh_token, rf_cp_epl_id })
  }
}
