import { InjectModel } from '@nestjs/mongoose'
import { Employee, EmployeeDocument } from './employees.model'
import { Model } from 'mongoose'
import { CreateEmployeeDto } from '../dto/create-employee.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateEmployeeDto } from '../dto/update-employee.dto'
import { Injectable } from '@nestjs/common'

@Injectable()
export class EmloyeeRepository {
  constructor(@InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>) {}

  async create(createEmployeeDto: CreateEmployeeDto, account: IAccount): Promise<EmployeeDocument> {
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

  async findOneByCreate({ epl_email, epl_restaurant_id }): Promise<EmployeeDocument> {
    return (await this.employeeModel.findOne({ epl_email, epl_restaurant_id }).lean()) as EmployeeDocument
  }

  async totalItems(account: IAccount, isDeleted: boolean): Promise<number> {
    return await this.employeeModel
      .countDocuments({
        isDeleted,
        epl_restaurant_id: account.account_restaurant_id
      })
      .lean()
  }

  async findAllPagination(
    { offset, defaultLimit, sort, population },
    account: IAccount,
    isDeleted: boolean
  ): Promise<EmployeeDocument[]> {
    return this.employeeModel
      .find({
        isDeleted,
        epl_restaurant_id: account.account_restaurant_id
      })
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate(population)
      .exec()
  }

  async findOneById({ _id, account }: { _id: string; account: IAccount }): Promise<EmployeeDocument> {
    return (await this.employeeModel
      .findOne({ _id, epl_restaurant_id: account.account_restaurant_id })
      .lean()) as EmployeeDocument
  }

  async update(updateEmployeeDto: UpdateEmployeeDto, account: IAccount): Promise<EmployeeDocument> {
    const { _id, epl_address, epl_avatar, epl_email, epl_gender, epl_name, epl_phone } = updateEmployeeDto
    const { account_email, account_restaurant_id } = account
    return (await this.employeeModel
      .findOneAndUpdate(
        { _id, epl_restaurant_id: account_restaurant_id },
        {
          epl_address,
          epl_avatar,
          epl_email,
          epl_gender,
          epl_name,
          epl_phone,
          updatedBy: {
            email: account_email,
            _id: account_restaurant_id
          }
        },
        { new: true }
      )
      .lean()) as EmployeeDocument
  }

  async delete({ _id, account }: { _id: string; account: IAccount }): Promise<EmployeeDocument> {
    return (await this.employeeModel
      .findOneAndUpdate(
        { _id, epl_restaurant_id: account.account_restaurant_id },
        {
          isDeleted: true,
          deletedBy: {
            email: account.account_email,
            _id: account.account_restaurant_id
          },
          deletedAt: new Date()
        },
        { new: true }
      )
      .lean()) as EmployeeDocument
  }

  async restore({ _id, account }: { _id: string; account: IAccount }): Promise<EmployeeDocument> {
    return (await this.employeeModel
      .findOneAndUpdate(
        { _id, epl_restaurant_id: account.account_restaurant_id },
        {
          isDeleted: false,
          updatedBy: {
            email: account.account_email,
            _id: account.account_restaurant_id
          },
          deletedBy: null
        },
        { new: true }
      )
      .lean()) as EmployeeDocument
  }

  async updateStatus({ _id, epl_status }, account: IAccount): Promise<EmployeeDocument> {
    return (await this.employeeModel
      .findOneAndUpdate(
        { _id, epl_restaurant_id: account.account_restaurant_id },
        {
          epl_status,
          updatedBy: {
            email: account.account_email,
            _id: account.account_restaurant_id
          }
        },
        { new: true }
      )
      .lean()) as EmployeeDocument
  }

  async findOneByEmailWithLogin({
    epl_email,
    epl_restaurant_id
  }: {
    epl_email: string
    epl_restaurant_id: string
  }): Promise<EmployeeDocument> {
    return (await this.employeeModel
      .findOne({
        isDeleted: false,
        epl_status: 'enable',
        epl_email,
        epl_restaurant_id
      })
      .lean()) as EmployeeDocument
  }

  async findOneByIdOfToken({ _id }): Promise<EmployeeDocument> {
    return (await this.employeeModel
      .findOne({
        _id,
        isDeleted: false,
        epl_status: 'enable'
      })
      .lean()) as EmployeeDocument
  }

  async getInfor({ _id, epl_restaurant_id }): Promise<EmployeeDocument> {
    return (await this.employeeModel
      .findOne({
        _id,
        epl_restaurant_id
      })
      .select('-__v -updatedBy -updatedAt -createdAt -isDeleted -deletedBy -deletedAt -epl_status -createdBy')
      .lean()) as EmployeeDocument
  }
}
