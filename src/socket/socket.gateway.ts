import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { GuestRestaurantService } from 'src/guest-restaurant/guest-restaurant.service'
import { AccountsService } from 'src/accounts/accounts.service'
import { KEY_SOCKET_GUEST_ORDER_DISH_SUMMARY_ID, KEY_SOCKET_RESTAURANT_ID } from 'src/constants/key.socket'

@Injectable()
@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server
  constructor(
    @Inject(forwardRef(() => GuestRestaurantService))
    private readonly guestRestaurantService: GuestRestaurantService,
    private readonly accountsService: AccountsService
  ) {}

  handleEmitSocket({ data, event, to }) {
    if (to) {
      this.server.to(to).emit(event, data)
    } else {
      this.server.emit(event, data)
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(socket: Socket): any {}

  // async handleConnection(socket: Socket) {
  //   const authHeader = socket.handshake.auth.authorization?.split(' ')[1]
  //   const type = socket.handshake.auth.type

  //   if (authHeader && type === 'guest') {
  //     try {
  //       socket.data = this.guestRestaurantService.verifyToken(authHeader, 'access_token')
  //       socket.join(`${KEY_SOCKET_GUEST_ORDER_DISH_SUMMARY_ID}:${socket.data.order_id}`)
  //       return
  //     } catch (e) {
  //       console.log(e)
  //       socket.disconnect()
  //       return
  //     }
  //   }
  //   if (authHeader && type === 'restaurant') {
  //     const refresh_token = socket.handshake.auth.refresh_token?.split(' ')[1]
  //     if (refresh_token) {
  //       try {
  //         const { rf_public_key_refresh_token, rf_public_key_access_token } =
  //           await this.accountsService.findRefreshToken({
  //             rf_refresh_token: refresh_token
  //           })

  //         if (!rf_public_key_refresh_token || !rf_public_key_access_token) {
  //           socket.disconnect()
  //         }
  //         const dataToken = await Promise.all([
  //           this.accountsService.verifyToken(authHeader, rf_public_key_access_token),
  //           this.accountsService.verifyToken(refresh_token, rf_public_key_refresh_token)
  //         ])

  //         if (!dataToken[0] || !dataToken[1]) {
  //           socket.disconnect()
  //         }

  //         const account: any = await this.accountsService.findAccoutById({ _id: dataToken[0]._id })
  //         if (!account) {
  //           socket.disconnect()
  //         }
  //         socket.data = account
  //         socket.join(`${KEY_SOCKET_RESTAURANT_ID}:${String(socket.data.account_restaurant_id)}`)
  //         return
  //       } catch (e) {
  //         console.log(e)
  //         socket.disconnect()
  //         return
  //       }
  //     } else {
  //       socket.disconnect()
  //     }
  //   } else {
  //     socket.disconnect()
  //   }
  // }

  async handleConnection(socket: Socket): Promise<void | any> {
    const authHeader = socket.handshake.auth.authorization?.split(' ')[1]
    const type = socket.handshake.auth.type

    if (!authHeader) {
      return socket.disconnect()
    }

    try {
      if (type === 'guest') {
        await this.handleGuestConnection(socket, authHeader)
      } else if (type === 'restaurant') {
        const refresh_token = socket.handshake.auth.refresh_token?.split(' ')[1]
        if (!refresh_token) {
          return socket.disconnect()
        }
        await this.handleRestaurantConnection(socket, authHeader, refresh_token)
      } else {
        socket.disconnect()
      }
    } catch (e) {
      console.log(e)
      socket.disconnect()
    }
  }

  private async handleGuestConnection(socket: Socket, authHeader: string): Promise<void> {
    try {
      socket.data = this.guestRestaurantService.verifyToken(authHeader, 'access_token')
      socket.join(`${KEY_SOCKET_GUEST_ORDER_DISH_SUMMARY_ID}:${socket.data.order_id}`)
    } catch (e) {
      console.log(e)
      throw new Error('Guest authentication failed')
    }
  }

  private async handleRestaurantConnection(socket: Socket, authHeader: string, refresh_token: string): Promise<void> {
    const { rf_public_key_refresh_token, rf_public_key_access_token } = await this.accountsService.findRefreshToken({
      rf_refresh_token: refresh_token
    })

    if (!rf_public_key_refresh_token || !rf_public_key_access_token) {
      throw new Error('Invalid refresh or access token')
    }

    const [accessTokenData, refreshTokenData] = await Promise.all([
      this.accountsService.verifyToken(authHeader, rf_public_key_access_token),
      this.accountsService.verifyToken(refresh_token, rf_public_key_refresh_token)
    ])

    if (!accessTokenData || !refreshTokenData) {
      throw new Error('Token verification failed')
    }

    const account = await this.accountsService.findAccoutById({ _id: accessTokenData._id })
    if (!account) {
      throw new Error('Account not found')
    }

    socket.data = account
    socket.join(`${KEY_SOCKET_RESTAURANT_ID}:${String(socket.data.account_restaurant_id)}`)
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    // console.log('disconnect', socket.id)
  }
}
