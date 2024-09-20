import { InjectModel } from '@nestjs/mongoose'
import { Employee, EmployeeDocument } from './employees.model'
import { Model } from 'mongoose'
import { CreateEmployeeDto } from '../dto/create-employee.dto'
import { IAccount } from 'src/accounts/accounts.interface'

export class EmloyeeRepository {
  constructor(@InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>) {}

  async create(createEmployeeDto: CreateEmployeeDto, account: IAccount) {
    const { epl_email, epl_name, epl_address, epl_phone, epl_gender, epl_avatar } = createEmployeeDto
    const { account_email, account_restaurant_id } = account
    return await this.employeeModel.create({
      epl_restaurant_id: account_restaurant_id,
      epl_email,
      epl_name,
      epl_address,
      epl_phone,
      epl_gender,
      epl_avatar,
      createdBy: {
        email: account_email,
        _id: account_restaurant_id
      }
    })
  }

  async findOneByCreate({ epl_email, epl_restaurant_id }) {
    return await this.employeeModel.findOne({ epl_email, epl_restaurant_id }).lean()
  }

  async totalItems(account: IAccount) {
    return await this.employeeModel
      .countDocuments({
        isDeleted: false,
        epl_restaurant_id: account.account_restaurant_id
      })
      .lean()
  }

  async findAllPagination({ offset, defaultLimit, sort, population }, account) {
    return this.employeeModel
      .find({
        isDeleted: false,
        epl_restaurant_id: account.account_restaurant_id
      })
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate(population)
      .exec()
  }
}
