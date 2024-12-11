import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { RefreshTokenAccount, RefreshTokenAccountDocument } from './refresh-token.model'

@Injectable()
export class RefreshTokenAccountRepository {
  constructor(@InjectModel(RefreshTokenAccount.name) private refreshTokenAccount: Model<RefreshTokenAccountDocument>) {}

  async createToken({
    rf_cp_epl_id,
    rf_refresh_token,
    rf_public_key_refresh_token,
    rf_public_key_access_token
  }: {
    rf_cp_epl_id: string
    rf_refresh_token: string
    rf_public_key_refresh_token: string
    rf_public_key_access_token: string
  }): Promise<RefreshTokenAccountDocument> {
    return await this.refreshTokenAccount.create({
      rf_cp_epl_id,
      rf_refresh_token,
      rf_public_key_refresh_token,
      rf_public_key_access_token
    })
  }

  async findRefreshToken({ rf_refresh_token }: { rf_refresh_token: string }): Promise<RefreshTokenAccountDocument> {
    return await this.refreshTokenAccount.findOne({ rf_refresh_token })
  }

  async logoutAll({ rf_cp_epl_id }: { rf_cp_epl_id: string }): Promise<{ deletedCount: number }> {
    return await this.refreshTokenAccount.deleteMany({ rf_cp_epl_id })
  }
  async deleteToken({
    rf_refresh_token,
    rf_cp_epl_id
  }: {
    rf_refresh_token: string
    rf_cp_epl_id: string
  }): Promise<{ deletedCount: number }> {
    return await this.refreshTokenAccount.deleteOne({ rf_refresh_token, rf_cp_epl_id })
  }
}
