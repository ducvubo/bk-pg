import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CategoryRestaurant, CategoryRestaurantDocument } from './category-restaurant.model'
import { CreateCategoryRestaurantDto } from '../dto/create-catgory-restaurant.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateCategoryRestaurantDto } from '../dto/update-category-restaurant.dto'
import { UpdateStatusCatResDto } from '../dto/update-status-cat-res.dto'

export class CategoryRestauranRepository {
  constructor(
    @InjectModel(CategoryRestaurant.name) private categoryRestaurantModel: Model<CategoryRestaurantDocument>
  ) {}

  async createCategoryRestaurant(
    createCategoryRestaurantDto: CreateCategoryRestaurantDto & { cat_res_slug: string },
    account: IAccount
  ): Promise<CategoryRestaurantDocument> {
    const { cat_res_name, cat_res_icon, cat_res_short_description, cat_res_slug } = createCategoryRestaurantDto

    const newCategoryRestaurant = new this.categoryRestaurantModel({
      cat_res_name,
      cat_res_icon,
      cat_res_short_description,
      cat_res_slug: cat_res_slug,
      cat_res_id: account.account_restaurant_id,
      createdBy: {
        _id: account.account_employee_id ? account.account_employee_id : account.account_restaurant_id,
        email: account.account_email
      }
    })
    return await newCategoryRestaurant.save()
  }

  async findOneById(id: string, account: IAccount): Promise<CategoryRestaurantDocument> {
    return (await this.categoryRestaurantModel
      .findOne({
        _id: id,
        cat_res_id: account.account_restaurant_id
      })
      .lean()) as CategoryRestaurantDocument
  }

  async totalItems(account: IAccount, isDeleted: boolean): Promise<number> {
    return await this.categoryRestaurantModel.countDocuments({ cat_res_id: account.account_restaurant_id, isDeleted })
  }

  async findAllPagination(
    { offset, defaultLimit, sort, population },
    account: IAccount,
    isDeleted: boolean
  ): Promise<CategoryRestaurantDocument[]> {
    return await this.categoryRestaurantModel
      .find({
        cat_res_id: account.account_restaurant_id,
        isDeleted
      })
      .select('cat_res_name cat_res_icon cat_res_short_description cat_res_status cat_res_slug cat_res_id')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .populate(population)
      .exec()
  }

  async updateCategoryRestaurant(
    updateCategoryRestaurantDto: UpdateCategoryRestaurantDto,
    account: IAccount
  ): Promise<CategoryRestaurantDocument> {
    const { _id, cat_res_name, cat_res_icon, cat_res_short_description } = updateCategoryRestaurantDto

    return await this.categoryRestaurantModel.findOneAndUpdate(
      { _id, cat_res_id: account.account_restaurant_id },
      {
        cat_res_name,
        cat_res_icon,
        cat_res_short_description,
        updatedBy: {
          _id: account.account_employee_id ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },
      { new: true }
    )
  }

  async deleteCategoryRestaurant(id: string, account: IAccount): Promise<CategoryRestaurantDocument> {
    return await this.categoryRestaurantModel.findOneAndUpdate(
      { _id: id, cat_res_id: account.account_restaurant_id },
      {
        isDeleted: true,
        deletedBy: {
          _id: account.account_employee_id ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },
      { new: true }
    )
  }

  async restoreCategoryRestaurant(id: string, account: IAccount): Promise<CategoryRestaurantDocument> {
    return await this.categoryRestaurantModel.findOneAndUpdate(
      { _id: id, cat_res_id: account.account_restaurant_id },
      {
        isDeleted: false,
        deletedBy: {
          _id: account.account_employee_id ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },
      { new: true }
    )
  }

  async updateStatusCategoryRestaurant(
    updateStatusCatResDto: UpdateStatusCatResDto,
    account: IAccount
  ): Promise<CategoryRestaurantDocument> {
    const { _id, cat_res_status } = updateStatusCatResDto

    return await this.categoryRestaurantModel.findOneAndUpdate(
      { _id, cat_res_id: account.account_restaurant_id },
      {
        cat_res_status,
        updatedBy: {
          _id: account.account_employee_id ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },

      { new: true }
    )
  }
}
