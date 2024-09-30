import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { KEY_LOGOUT_TABLE_RESTAURANT } from 'src/constants/key.redis'
import { GuestRestaurantService } from 'src/guest-restaurant/guest-restaurant.service'
import { getCacheIO } from 'src/utils/cache'
import { UnauthorizedCodeError } from 'src/utils/errorResponse'

@Injectable()
export class GuestRestaurantAuthGuard implements CanActivate {
  constructor(private guestRestaurantService: GuestRestaurantService) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest()
    const access_token = request.headers['x-at-guest'] ? request.headers['x-at-guest'].split(' ')[1] : null
    const refresh_token = request.headers['x-rf-guest'] ? request.headers['x-rf-guest'].split(' ')[1] : null

    // if (!access_token || !refresh_token) throw new UnauthorizedCodeError('Token không hợp lệ1', -10)
    if (!access_token || !refresh_token) throw new UnauthorizedCodeError('Token không hợp lệ1', -10)

    try {
      const dataToken = await Promise.all([
        this.guestRestaurantService.verifyToken(access_token, 'access_token'),
        this.guestRestaurantService.verifyToken(refresh_token, 'refresh_token')
      ])

      const cacheExist = await getCacheIO(`${KEY_LOGOUT_TABLE_RESTAURANT}:${dataToken[0]._id}`)

      if (cacheExist) throw new UnauthorizedCodeError('Token không hợp lệ3', -10)

      if (!dataToken[0] || !dataToken[1]) throw new UnauthorizedCodeError('Token không hợp lệ2', -10)
      request.guest = dataToken[0]
      return true
    } catch (error) {
      console.log(error)
      throw new UnauthorizedCodeError('Token không hợp lệ 3', -10)
    }
  }
}
