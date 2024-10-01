import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './user.model'
import { Model } from 'mongoose'
import { generateNumberString } from 'src/utils'
import { CreateUserDto } from '../dto/create-user.dto'
import { IUser } from '../users.interface'
import { UpdateUserDto } from '../dto/update-user.dto'
import { UpdateStatusUser } from '../dto/update-status.dto'

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUserByEmail({ us_email }: { us_email: string }) {
    return await this.userModel.findOne({ us_email, us_type: 'local' }).lean()
  }

  async findUserLoginByEmail({ us_email }: { us_email: string }) {
    return await this.userModel.findOne({ us_email, us_type: 'local' }).lean()
  }

  async registerUser({ us_email, us_password }: { us_email: string; us_password: string }) {
    return await this.userModel.create({
      us_email,
      us_password,
      us_name: generateNumberString(20),
      us_phone: generateNumberString(10),
      us_verify: false
    })
  }

  async findOneById({ _id }) {
    return await this.userModel
      .findById(_id)
      .populate({
        path: 'us_role', // Tên trường cần populate
        select: 'rl_name rl_description'
      })
      .lean()
      .select('us_email us_name us_address us_phone us_gender us_avatar')
  }

  async verifyAccount({ us_email }) {
    return await this.userModel.findOneAndUpdate({ us_email }, { us_verify: true }, { new: true })
  }

  async changePassword({ us_email, us_password }) {
    return await this.userModel.findOneAndUpdate({ us_email }, { us_password }, { new: true })
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { us_address, us_email, us_gender, us_name, us_password, us_phone, us_role, us_avatar } = createUserDto
    return await this.userModel.create({
      us_address,
      us_email,
      us_gender,
      us_name,
      us_password,
      us_phone,
      us_role,
      us_type: 'local',
      us_verify: true,
      us_avatar,
      createdBy: {
        _id: user._id,
        email: user.us_email
      }
    })
  }

  async totalItems(type: boolean) {
    return await this.userModel
      .countDocuments({
        isDeleted: type
      })
      .lean()
  }

  async findAllPagination({ offset, defaultLimit, sort, population }, type: boolean) {
    return this.userModel
      .find({
        isDeleted: type
      })
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy -us_password')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate(population)
      .exec()
  }

  async findOne({ _id }: { _id: string }) {
    return await this.userModel.findById(_id).select('-us_password').lean() // Populate role
  }

  async updateUser(updateUserDto: UpdateUserDto, user: IUser) {
    const { us_address, us_email, us_gender, us_name, us_phone, us_role, us_avatar, _id } = updateUserDto
    return await this.userModel.findByIdAndUpdate(
      _id,
      {
        us_address,
        us_email,
        us_gender,
        us_name,
        us_phone,
        us_role,
        us_avatar,
        updatedBy: {
          email: user.us_email,
          _id: user._id
        }
      },
      { new: true }
    )
  }

  async removeUser({ _id }: { _id: string }, user: IUser) {
    return await this.userModel.findByIdAndUpdate(
      _id,
      {
        isDeleted: true,
        deletedBy: {
          email: user.us_email,
          _id: user._id
        },
        deletedAt: new Date()
      },
      { new: true }
    )
  }

  async restore({ _id }, user: IUser) {
    return await this.userModel
      .findByIdAndUpdate(
        _id,
        {
          isDeleted: false,
          updatedBy: {
            email: user.us_email,
            _id: user._id
          }
        },
        { new: true }
      )
      .lean()
  }

  async updateStatus(updateStatusUser: UpdateStatusUser, user: IUser) {
    return await this.userModel.findByIdAndUpdate(
      updateStatusUser._id,
      {
        us_status: updateStatusUser.status,
        updatedBy: {
          email: user.us_email,
          _id: user._id
        }
      },
      { new: true }
    )
  }
}
