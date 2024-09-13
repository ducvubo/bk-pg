import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class IdUserGuestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    const id_user_guest = request.headers['id_user_guest']
    if (id_user_guest) {
      response.setHeader('id_user_guest', id_user_guest)
    } else {
      const id_user_guest_new = `Guest-${uuidv4()}`
      response.setHeader('id_user_guest', id_user_guest_new)
    }
    return next.handle().pipe(tap())
  }
}
