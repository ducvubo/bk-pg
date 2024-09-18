import { Controller, Get } from '@nestjs/common'
import { CronService } from './cron.service'
import { ResponseMessage } from 'src/decorator/customize'

@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}
  @Get()
  @ResponseMessage('Test cron')
  async test() {
    return await this.cronService.checkCancelBookTable()
  }
}
