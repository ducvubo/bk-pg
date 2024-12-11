import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Category, CategoryDocument } from './category.model'
import { Model } from 'mongoose'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { IUser } from 'src/users/users.interface'
import { generateSlug } from 'src/utils'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { UpdateStatusCategoryDto } from '../dto/update-status-category.dto'

@Injectable()
export class CategoryRepository {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async create(createCategoryDto: CreateCategoryDto, user: IUser): Promise<CategoryDocument> {
    const { category_name, category_description, category_image, category_parent_id } = createCategoryDto
    const category_slug = generateSlug(category_name)
    return await this.categoryModel.create({
      category_name,
      category_description,
      category_image,
      category_parent_id,
      category_slug,
      category_status: 'enable',
      createdBy: {
        email: user.us_email,
        _id: user._id
      }
    })
  }

  async findAll(): Promise<CategoryDocument[]> {
    return await this.categoryModel
      .find({
        isDeleted: false,
        category_status: 'enable'
      })
      .select('category_name _id category_parent_id')
      .exec()
  }

  async findOneByName({ category_name }: { category_name: string }): Promise<CategoryDocument> {
    return await this.categoryModel.findOne({ category_name })
  }

  async totalItems(isDeleted: boolean): Promise<number> {
    return await this.categoryModel
      .countDocuments({
        isDeleted
      })
      .lean()
  }

  async findAllPagination({ offset, defaultLimit, sort, population }, isDeleted: boolean): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({
        isDeleted
      })
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate(population)
      .populate('category_parent_id')
      .exec()
  }

  async findOneById({ _id }: { _id: string }): Promise<CategoryDocument> {
    return await this.categoryModel
      .findOne({
        _id
      })
      .populate('category_parent_id')
  }

  async updateCategory(updateCategoryDto: UpdateCategoryDto, user: IUser): Promise<CategoryDocument> {
    const { _id, category_description, category_image, category_name, category_parent_id } = updateCategoryDto
    return await this.categoryModel.findOneAndUpdate(
      {
        _id
      },
      {
        category_description,
        category_image,
        category_name,
        category_parent_id,
        updatedBy: {
          email: user.us_email,
          _id: user._id
        }
      },
      {
        new: true
      }
    )
  }

  async remove({ _id, user }: { _id: string; user: IUser }): Promise<CategoryDocument> {
    return await this.categoryModel.findOneAndUpdate(
      {
        _id
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: {
          email: user.us_email,
          _id: user._id
        }
      },
      {
        new: true
      }
    )
  }

  async restore({ _id, user }: { _id: string; user: IUser }): Promise<CategoryDocument> {
    return await this.categoryModel.findOneAndUpdate(
      {
        _id
      },
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedBy: {
          email: user.us_email,
          _id: user._id
        }
      },
      {
        new: true
      }
    )
  }

  async updateStatus(updateStatusCategoryDto: UpdateStatusCategoryDto, user: IUser): Promise<CategoryDocument> {
    const { _id, category_status } = updateStatusCategoryDto
    return await this.categoryModel.findOneAndUpdate(
      {
        _id
      },
      {
        category_status,
        updatedBy: {
          email: user.us_email,
          _id: user._id
        }
      },
      {
        new: true
      }
    )
  }

  async findCategoryHome({ limit }) {
    return await this.categoryModel
      .find({
        isDeleted: false,
        category_status: 'enable'
      })
      .select('category_name _id category_parent_id category_image')
      .limit(limit)
      .exec()
  }
}
