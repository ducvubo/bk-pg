import { HttpException, HttpStatus } from '@nestjs/common'

export class ConflictError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT)
  }
}

export class ServerError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

export class BadRequestError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST)
  }
}

export class NotFoundError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND)
  }
}
