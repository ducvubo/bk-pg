import { Injectable } from '@nestjs/common'
import { RefreshTokenCPAndEPLRepository } from './model/refresh-token.repo'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedError } from 'src/utils/errorResponse'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenCPAndEPLRepository: RefreshTokenCPAndEPLRepository,
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

  async generateRefreshTokenCP({ _id, rf_type }: { _id: string; rf_type: 'restaurant' | 'employee' }) {
    const token = await Promise.all([
      this.signToken(String(_id), 'access_token'),
      this.signToken(String(_id), 'refresh_token')
    ])

    const accessPublicKeyString = token[0].publicKey.export({ type: 'spki', format: 'pem' }).toString()
    const refreshPublicKeyString = token[1].publicKey.export({ type: 'spki', format: 'pem' }).toString()

    await this.refreshTokenCPAndEPLRepository.createToken({
      rf_cp_epl_id: _id,
      rf_type: rf_type,
      rf_refresh_token: token[1].token,
      rf_public_key_refresh_token: refreshPublicKeyString,
      rf_public_key_access_token: accessPublicKeyString
    })

    return {
      access_token_rtr: token[0].token,
      refresh_token_rtr: token[1].token
    }
  }

  async findRefreshToken({ rf_refresh_token }: { rf_refresh_token: string }) {
    return await this.refreshTokenCPAndEPLRepository.findRefreshToken({ rf_refresh_token })
  }

  async logoutAll({ rf_cp_epl_id, type }: { rf_cp_epl_id: string; type: 'restaurant' | 'employee' }) {
    return await this.refreshTokenCPAndEPLRepository.logoutAll({ rf_cp_epl_id, type })
  }

  async deleteToken({ rf_refresh_token, rf_cp_epl_id }: { rf_refresh_token: string; rf_cp_epl_id: string }) {
    return await this.refreshTokenCPAndEPLRepository.deleteToken({ rf_refresh_token, rf_cp_epl_id })
  }
}
