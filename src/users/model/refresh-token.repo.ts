import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { RefreshTokenUser, RefreshTokenUserDocument } from './refresh-token.model'
import { Model } from 'mongoose'
import { IRefreshToken } from '../users.interface'

@Injectable()
export class RefreshTokenUserRepository {
  constructor(@InjectModel(RefreshTokenUser.name) private refreshTokenUser: Model<RefreshTokenUserDocument>) {}

  async create(refreshToken: IRefreshToken): Promise<RefreshTokenUserDocument> {
    const { rf_public_key_access_token, rf_public_key_refresh_token, rf_refresh_token, rf_us_id } = refreshToken
    return await this.refreshTokenUser.create({
      rf_us_id,
      rf_refresh_token,
      rf_public_key_refresh_token,
      rf_public_key_access_token
    })
  }

  async findOneByRefreshToken({ rf_refresh_token }: { rf_refresh_token: string }): Promise<RefreshTokenUserDocument> {
    return await this.refreshTokenUser.findOne({ rf_refresh_token })
  }

  async logoutAll({ rf_us_id }: { rf_us_id: string }): Promise<{ deletedCount: number }> {
    return await this.refreshTokenUser.deleteMany({ rf_us_id })
  }

  async deleteToken({
    rf_refresh_token,
    rf_us_id
  }: {
    rf_refresh_token: string
    rf_us_id: string
  }): Promise<{ deletedCount: number }> {
    return await this.refreshTokenUser.deleteOne({ rf_refresh_token, rf_us_id })
  }
}
