import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { CronController } from './cron.controller'
import { BookTableModule } from 'src/book-table/book-table.module'

@Module({
  imports: [BookTableModule],
  controllers: [CronController],
  providers: [CronService]
})
export class CronModule {}
