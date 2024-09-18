import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Accounts, AccountsDocument } from './accounts.model'

@Injectable()
export class AccountRepository {
  constructor(@InjectModel(Accounts.name) private accountModel: Model<AccountsDocument>) {}
  async createAccount({
    account_email,
    account_password,
    account_type,
    account_restaurant_id,
    account_employee_id
  }: {
    account_email: string
    account_password: string
    account_type: 'restaurant' | 'employee'
    account_restaurant_id: string
    account_employee_id?: string
  }) {
    return await this.accountModel.create({
      account_email,
      account_password,
      account_type,
      account_restaurant_id,
      account_employee_id
    })
  }

  async findAccountByIdRestaurant({ account_restaurant_id }: { account_restaurant_id: string }) {
    return await this.accountModel.findOne({ account_restaurant_id, account_type: 'restaurant' }).lean()
  }
}
