import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { AccountsService } from 'src/accounts/accounts.service'
import { RestaurantsService } from 'src/restaurants/restaurants.service'
import { UnauthorizedCodeError } from 'src/utils/errorResponse'

@Injectable()
export class RestaurantOrEmployeeAuthGuard implements CanActivate {
  constructor(
    private accountsService: AccountsService,
    private readonly restaurantsService: RestaurantsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest()
    const access_token = request.headers['x-at-rtr'] ? request.headers['x-at-rtr'].split(' ')[1] : null
    const refresh_token = request.headers['x-rf-rtr'] ? request.headers['x-rf-rtr'].split(' ')[1] : null
    if (!access_token || !refresh_token) throw new UnauthorizedCodeError('Token không hợp lệ1', -10)
    // if (!access_token || !refresh_token) throw new ForbiddenError('Token không hợp lệ1')

    try {
      const { rf_public_key_refresh_token, rf_public_key_access_token } = await this.accountsService.findRefreshToken({
        rf_refresh_token: refresh_token
      })

      if (!rf_public_key_refresh_token || !rf_public_key_access_token)
        throw new UnauthorizedCodeError('Token không hợp lệ4', -10)

      const dataToken = await Promise.all([
        this.accountsService.verifyToken(access_token, rf_public_key_access_token),
        this.accountsService.verifyToken(refresh_token, rf_public_key_refresh_token)
      ])

      if (!dataToken[0] || !dataToken[1]) throw new UnauthorizedCodeError('Token không hợp lệ2', -10)

      const restaurant: any = await this.restaurantsService.findOneByIdOfToken({ _id: dataToken[0]._id })
      if (!restaurant) throw new UnauthorizedCodeError('Token không hợp lệ 5', -10)

      delete restaurant.restaurant_password
      restaurant.email = restaurant.restaurant_email
      request.restaurant = restaurant
      return true
    } catch (error) {
      console.log(error)
      throw new UnauthorizedCodeError('Token không hợp lệ 3', -10)
    }
  }
}
