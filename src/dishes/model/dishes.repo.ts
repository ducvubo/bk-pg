import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Dish, DishDocument } from './dishes.model'
import { CreateDishDto } from '../dto/create-dish.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateDishDto } from '../dto/update-dish.dto'

export class DishRepository {
  constructor(@InjectModel(Dish.name) private DishModel: Model<DishDocument>) {}

  async findOneByName({ dish_name, dish_restaurant_id }): Promise<DishDocument> {
    return await this.DishModel.findOne({ dish_name, dish_restaurant_id })
  }

  async findAllByNames({ dish_name, dish_restaurant_id, _id }): Promise<DishDocument[]> {
    return await this.DishModel.find({ dish_name, dish_restaurant_id, _id: { $ne: _id } })
  }

  async createDish(createDishDto: CreateDishDto, account: IAccount): Promise<DishDocument> {
    const {
      dish_name,
      dish_description,
      dish_price,
      dish_priority,
      dish_image,
      dish_note,
      dish_sale,
      dish_short_description
    } = createDishDto
    const { account_restaurant_id, account_employee_id, account_email } = account

    return await this.DishModel.create({
      dish_name,
      dish_description,
      dish_price,
      dish_priority,
      dish_image,
      dish_note,
      dish_sale,
      dish_short_description,
      dish_restaurant_id: account_restaurant_id,
      dish_status: 'enable',
      createdBy: {
        _id: account_employee_id ? account_employee_id : account_restaurant_id,
        email: account_email
      }
    })
  }

  async totalItems(account: IAccount, isDeleted: boolean): Promise<number> {
    return await this.DishModel.countDocuments({
      isDeleted,
      dish_restaurant_id: account.account_restaurant_id
    }).lean()
  }

  async findAllPagination(
    { offset, defaultLimit, sort, population },
    account: IAccount,
    isDeleted: boolean
  ): Promise<DishDocument[]> {
    return this.DishModel.find({
      isDeleted,
      dish_restaurant_id: account.account_restaurant_id
    })
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate(population)
      .exec()
  }

  async findOneById({ _id, account }: { _id: string; account: IAccount }): Promise<DishDocument> {
    return await this.DishModel.findOne({ _id, dish_restaurant_id: account.account_restaurant_id })
  }

  async update(updateDishDto: UpdateDishDto, account: IAccount): Promise<DishDocument> {
    const {
      _id,
      dish_name,
      dish_description,
      dish_price,
      dish_priority,
      dish_image,
      dish_note,
      dish_sale,
      dish_short_description
    } = updateDishDto
    const { account_restaurant_id, account_employee_id, account_email } = account

    return await this.DishModel.findOneAndUpdate(
      { _id, dish_restaurant_id: account_restaurant_id },
      {
        dish_name,
        dish_description,
        dish_price,
        dish_priority,
        dish_image,
        dish_note,
        dish_sale,
        dish_short_description,
        updatedBy: {
          _id: account_employee_id ? account_employee_id : account_restaurant_id,
          email: account_email
        }
      },
      { new: true }
    )
  }

  async remove(id: string, account: IAccount): Promise<DishDocument> {
    return await this.DishModel.findOneAndUpdate(
      { _id: id, dish_restaurant_id: account.account_restaurant_id },
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

  async restore(id: string, account: IAccount): Promise<DishDocument> {
    return await this.DishModel.findOneAndUpdate(
      { _id: id, dish_restaurant_id: account.account_restaurant_id },
      {
        isDeleted: false,
        deletedBy: null,
        deletedAt: null
      },
      { new: true }
    )
  }

  async updateStatus({ _id, dish_status }, account: IAccount): Promise<DishDocument> {
    return await this.DishModel.findOneAndUpdate(
      { _id, dish_restaurant_id: account.account_restaurant_id },
      {
        dish_status,
        updatedBy: {
          _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },
      { new: true }
    )
  }

  async findAllDishOrder({ dish_restaurant_id }: { dish_restaurant_id: string }): Promise<DishDocument[]> {
    return await this.DishModel.find({ dish_restaurant_id, dish_status: 'enable', isDeleted: false }).select(
      '-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy -dish_status'
    )
  }

  // async findOne({ _id }: { _id: string }, session: any = null) {
  //   return await this.DishModel.findOne({ _id, dish_status: 'enable' }).session(session).lean()
  // }

  async findOne({ _id }: { _id: string }): Promise<DishDocument> {
    return await this.DishModel.findOne({ _id, dish_status: 'enable' })
  }
}
