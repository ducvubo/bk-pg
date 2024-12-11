import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { BookTableRepository } from 'src/book-table/model/book-table.repo'

@Injectable()
export class CronService {
  constructor(private readonly bookTableRepository: BookTableRepository) {}

  @Cron('* * * * *') // 1 phut chay 1 lan
  async checkCancelBookTable(): Promise<void> {
    const allBookTableNoVerify = await this.bookTableRepository.findBookTableNoVerify()

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000 * 10) // thời gian 1 phút trước

    const filteredItems = allBookTableNoVerify.filter((item) => {
      return new Date(item.createdAt) < oneMinuteAgo
    })

    filteredItems?.map(async (item) => {
      await this.bookTableRepository.updateCancelBookTable({ _id: item._id })
    })
  }
}
