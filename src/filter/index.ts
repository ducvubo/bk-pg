import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common'
import { UnauthorizedCodeError } from 'src/utils/errorResponse'

@Catch(UnauthorizedCodeError)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedCodeError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = exception.getStatus()

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      code: exception.getCustomCode() // Truyền mã lỗi tùy chỉnh
    })
  }
}
