import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { ForbiddenError, UnauthorizedCodeError } from 'src/utils/errorResponse'

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const access_token = request.headers['x-at-tk'] ? request.headers['x-at-tk'].split(' ')[1] : null
    const refresh_token = request.headers['x-rf-tk'] ? request.headers['x-rf-tk'].split(' ')[1] : null

    // if (!access_token || !refresh_token) throw new UnauthorizedCodeError('Token không hợp lệ1', -10)
    if (!access_token || !refresh_token) throw new ForbiddenError('Token không hợp lệ1')

    try {
      const { rf_public_key_refresh_token, rf_public_key_access_token } = await this.usersService.findRefreshToken({
        rf_refresh_token: refresh_token
      })

      if (!rf_public_key_refresh_token || !rf_public_key_access_token)
        throw new UnauthorizedCodeError('Token không hợp lệ4', -10)

      const dataToken = await Promise.all([
        this.usersService.verifyToken(access_token, rf_public_key_access_token),
        this.usersService.verifyToken(refresh_token, rf_public_key_refresh_token)
      ])

      if (!dataToken[0] || !dataToken[1]) throw new UnauthorizedCodeError('Token không hợp lệ2', -10)

      const user = await this.usersService.findOneById({ _id: dataToken[0]._id })
      if (!user) throw new UnauthorizedCodeError('Token không hợp lệ 5', -10)

      delete user.us_password
      request.user = user
      return true
    } catch (error) {
      console.log(error)
      throw new UnauthorizedCodeError('Token không hợp lệ 3', -10)
    }
  }
}
