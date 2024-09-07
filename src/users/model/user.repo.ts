import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './User.model'
import { Model } from 'mongoose'
import { generateNumberString } from 'src/utils'

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUserByEmail({ us_email }: { us_email: string }) {
    return await this.userModel.findOne({ us_email }).lean()
  }

  async findUserLoginByEmail({ us_email }: { us_email: string }) {
    return await this.userModel.findOne({ us_email, us_type: 'local' }).lean()
  }

  async registerUser({ us_email, us_password }: { us_email: string; us_password: string }) {
    return await this.userModel.create({
      us_email,
      us_password,
      us_name: generateNumberString(20),
      us_address: generateNumberString(20),
      us_phone: generateNumberString(20),
      us_verify: false
    })
  }

  async findOneById({ _id }) {
    return await this.userModel.findById(_id).lean().select('us_email us_name us_address us_phone us_role')
  }

  async verifyAccount({ us_email }) {
    return await this.userModel.findOneAndUpdate({ us_email }, { us_verify: true }, { new: true })
  }

  async changePassword({ us_email, us_password }) {
    return await this.userModel.findOneAndUpdate({ us_email }, { us_password }, { new: true })
  }
}
