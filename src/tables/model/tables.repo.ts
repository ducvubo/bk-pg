import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Table, TableDocument } from './tables.model'
import { CreateTableDto } from '../dto/create-table.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { v4 as uuidv4 } from 'uuid'
import { UpdateTableDto } from '../dto/update-table.dto'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TableRepository {
  constructor(@InjectModel(Table.name) private tableModel: Model<TableDocument>) {}

  async create(createTableDto: CreateTableDto, account: IAccount) {
    const { tbl_capacity, tbl_description, tbl_name } = createTableDto
    const { account_restaurant_id, account_employee_id, account_email } = account

    return await this.tableModel.create({
      tbl_capacity,
      tbl_description,
      tbl_name,
      tbl_restaurant_id: account_restaurant_id,
      tbl_status: 'enable',
      tbl_token: uuidv4(),
      createdBy: {
        _id: account_employee_id ? account_employee_id : account_restaurant_id,
        email: account_email
      }
    })
  }

  async findOneByName({ tbl_name, tbl_restaurant_id }) {
    return await this.tableModel.findOne({ tbl_name, tbl_restaurant_id }).lean()
  }

  async findAllByNames({ tbl_name, tbl_restaurant_id, _id }) {
    return await this.tableModel.find({ tbl_name, tbl_restaurant_id, _id: { $ne: _id } }).lean()
  }

  async totalItems(account: IAccount, isDeleted) {
    return await this.tableModel
      .countDocuments({
        isDeleted,
        tbl_restaurant_id: account.account_restaurant_id
      })
      .lean()
  }

  async findAllPagination({ offset, defaultLimit, sort, population }, account: IAccount, isDeleted) {
    return this.tableModel
      .find({
        isDeleted,
        tbl_restaurant_id: account.account_restaurant_id
      })
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate(population)
      .exec()
  }

  async findOne({ _id, account }: { _id: string; account: IAccount }) {
    return await this.tableModel.findOne({ _id, tbl_restaurant_id: account.account_restaurant_id }).lean()
  }

  async update(updateTableDto: UpdateTableDto, account: IAccount) {
    const { _id, tbl_capacity, tbl_description, tbl_name } = updateTableDto
    const { account_restaurant_id, account_email } = account

    return await this.tableModel.findOneAndUpdate(
      { _id, tbl_restaurant_id: account_restaurant_id },
      {
        tbl_capacity,
        tbl_description,
        tbl_name,
        updatedBy: {
          _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
          email: account_email
        }
      },
      { new: true }
    )
  }

  async remove(id: string, account: IAccount) {
    return await this.tableModel.findOneAndUpdate(
      { _id: id, tbl_restaurant_id: account.account_restaurant_id },
      {
        isDeleted: true,
        deletedBy: {
          _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        },
        deletedAt: new Date()
      },
      { new: true }
    )
  }

  async restore(id: string, account: IAccount) {
    return await this.tableModel.findOneAndUpdate(
      { _id: id, tbl_restaurant_id: account.account_restaurant_id },
      {
        isDeleted: false,
        deletedBy: null,
        deletedAt: null
      },
      { new: true }
    )
  }

  async updateStatus({ _id, tbl_status }: { _id: string; tbl_status: string }, account: IAccount) {
    return await this.tableModel.findOneAndUpdate(
      { _id, tbl_restaurant_id: account.account_restaurant_id },
      {
        tbl_status,
        updatedBy: {
          _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },
      { new: true }
    )
  }

  async updateToken(id: string, account: IAccount) {
    return await this.tableModel.findOneAndUpdate(
      { _id: id, tbl_restaurant_id: account.account_restaurant_id },
      {
        tbl_token: uuidv4(),
        updatedBy: {
          _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },
      { new: true }
    )
  }

  async findOneByToken({ tbl_token, tbl_restaurant_id }: { tbl_token: string; tbl_restaurant_id: string }) {
    return await this.tableModel.findOne({ tbl_token, tbl_restaurant_id }).lean()
  }

  async updateStatusById({ _id, tbl_status }: { _id: string; tbl_status: string }) {
    return await this.tableModel.findOneAndUpdate({ _id }, { tbl_status }, { new: true })
  }

  async findByName({ tbl_name }: { tbl_name: string }) {
    return await this.tableModel.find({ tbl_name: { $regex: tbl_name, $options: 'i' } }).select('_id')
  }

  async findOneById({ _id }: { _id: string }) {
    return await this.tableModel.findById({ _id })
  }

  async totalItemsTableListOrder(filter, account: IAccount) {
    const query: any = {
      tbl_restaurant_id: account.account_restaurant_id,
      ...filter
    }

    // Nếu filter.tbl_name có giá trị, thêm điều kiện vào query
    if (filter?.tbl_name) {
      query.tbl_name = { $regex: filter.tbl_name, $options: 'i' }
    }
    const totalItems = await this.tableModel.countDocuments(query).lean()
    return totalItems
  }

  async findPaginationTableListOrder({ offset, defaultLimit, sort, filter }, account: IAccount) {
    const query: any = {
      tbl_restaurant_id: account.account_restaurant_id,
      ...filter
    }

    // Nếu filter.tbl_name có giá trị, thêm điều kiện vào query
    if (filter?.tbl_name) {
      query.tbl_name = { $regex: filter.tbl_name, $options: 'i' }
    }
    const listTable = await this.tableModel
      .find(query)
      .select(' -__v -createdBy -updatedBy -deletedAt -deletedBy -createdAt -updatedAt')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .exec()

    return listTable
  }
}
