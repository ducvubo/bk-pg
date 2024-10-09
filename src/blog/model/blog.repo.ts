import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Blog, BlogDocument } from './blog.model'
import { CreateBlogDto } from '../dto/create-blog.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateBlogDto } from '../dto/update-blog.dto'
import { UpdateStatusBlogDto } from '../dto/update-status-blog.dto'

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createBlog(createBlogDto: CreateBlogDto, account: IAccount) {
    const { blg_title, blg_content, blg_tag, blg_thumbnail } = createBlogDto
    return await this.blogModel.create({
      blg_title,
      blg_content,
      blg_tag,
      blg_thumbnail,
      blg_status: 'draft',
      blg_verify: 'inactive',
      blg_restaurant_id: account.account_restaurant_id,
      createdBy: {
        _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
        email: account.account_email
      }
    })
  }

  async totalItems(account: IAccount, isDeleted) {
    return await this.blogModel
      .countDocuments({
        isDeleted,
        blg_restaurant_id: account.account_restaurant_id
      })
      .lean()
  }

  async findAllPagination({ offset, defaultLimit, sort, population }, account: IAccount, isDeleted) {
    return this.blogModel
      .find({
        isDeleted,
        blg_restaurant_id: account.account_restaurant_id
      })
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) //ep kieu du lieu
      .populate(population)
      .populate({
        path: 'blg_tag',
        select: '-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy'
      })
      .exec()
  }

  async getBlogById(_id: string, account: IAccount) {
    return await this.blogModel
      .findOne({
        _id,
        blg_restaurant_id: account.account_restaurant_id
      })
      .select('-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy')
      .populate({
        path: 'blg_tag',
        select: '-updatedAt -createdAt -__v -createdBy -updatedBy -isDeleted -deletedAt -deletedBy'
      })
      .exec()
  }

  async updateBlog(updateBlogDto: UpdateBlogDto, account: IAccount) {
    const { _id, blg_content, blg_tag, blg_thumbnail, blg_title } = updateBlogDto
    return await this.blogModel.findOneAndUpdate(
      {
        _id,
        blg_restaurant_id: account.account_restaurant_id
      },
      {
        blg_content,
        blg_tag,
        blg_thumbnail,
        blg_title,
        updatedBy: {
          _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },
      { new: true }
    )
  }

  async updateStatusBlog(updateStatusBlogDto: UpdateStatusBlogDto, account: IAccount) {
    const { _id, blg_status } = updateStatusBlogDto
    return await this.blogModel.findOneAndUpdate(
      {
        _id,
        blg_restaurant_id: account.account_restaurant_id
      },
      {
        blg_status,
        updatedBy: {
          _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      },
      { new: true }
    )
  }

  async deleteBlog(_id: string, account: IAccount) {
    return await this.blogModel.findOneAndUpdate(
      {
        _id,
        blg_restaurant_id: account.account_restaurant_id
      },
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

  async restoreBlog(_id: string, account: IAccount) {
    return await this.blogModel.findOneAndUpdate(
      {
        _id,
        blg_restaurant_id: account.account_restaurant_id
      },
      {
        isDeleted: false,
        deletedBy: null,
        deletedAt: null
      },
      { new: true }
    )
  }
}
