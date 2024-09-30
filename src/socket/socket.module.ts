import { forwardRef, Module } from '@nestjs/common'
import { SocketService } from './socket.service'
import { SocketGateway } from './socket.gateway'
import { GuestRestaurantModule } from 'src/guest-restaurant/guest-restaurant.module'
import { AccountsModule } from 'src/accounts/accounts.module'

@Module({
  imports: [forwardRef(() => GuestRestaurantModule), forwardRef(() => AccountsModule)],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway]
})
export class SocketModule {}
