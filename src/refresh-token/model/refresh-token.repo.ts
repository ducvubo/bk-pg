import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { RefreshTokenCPAndEPL, RefreshTokenCPAndEPLDocument } from './refresh-token.model'

@Injectable()
export class RefreshTokenCPAndEPLRepository {
  constructor(
    @InjectModel(RefreshTokenCPAndEPL.name) private refreshTokenCPAndEPL: Model<RefreshTokenCPAndEPLDocument>
  ) {}

  async createToken({
    rf_cp_epl_id,
    rf_type,
    rf_refresh_token,
    rf_public_key_refresh_token,
    rf_public_key_access_token
  }: {
    rf_cp_epl_id: string
    rf_type: 'restaurant' | 'employee'
    rf_refresh_token: string
    rf_public_key_refresh_token: string
    rf_public_key_access_token: string
  }) {
    return await this.refreshTokenCPAndEPL.create({
      rf_cp_epl_id,
      rf_type,
      rf_refresh_token,
      rf_public_key_refresh_token,
      rf_public_key_access_token
    })
  }

  async findRefreshToken({ rf_refresh_token }: { rf_refresh_token: string }) {
    return await this.refreshTokenCPAndEPL.findOne({ rf_refresh_token }).lean()
  }

  async logoutAll({ rf_cp_epl_id, type }: { rf_cp_epl_id: string; type: 'restaurant' | 'employee' }) {
    return await this.refreshTokenCPAndEPL.deleteMany({ rf_cp_epl_id, rf_type: type })
  }
  async deleteToken({ rf_refresh_token, rf_cp_epl_id }: { rf_refresh_token: string; rf_cp_epl_id: string }) {
    return await this.refreshTokenCPAndEPL.deleteOne({ rf_refresh_token, rf_cp_epl_id })
  }
}
