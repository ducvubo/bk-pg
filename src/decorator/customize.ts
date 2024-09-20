import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'

export const RESPONSE_MESSAGE = 'response_message'
export const ResponseMessage = (message: string, statusCode?: number) =>
  SetMetadata(RESPONSE_MESSAGE, { message, statusCode })

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})

export const Acccount = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.account
})
