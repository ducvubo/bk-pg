import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Category, CategoryDocument } from './category.model'
import { Model } from 'mongoose'

@Injectable()
export class CategoryRepository {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async create({ category_name }: { category_name: string }) {
    return await this.categoryModel.create({ category_name })
  }

  async findAll() {
    return await this.categoryModel.find().select('category_name _id').exec()
  }

  async findOne({ category_name }: { category_name: string }) {
    return await this.categoryModel.findOne({ category_name }).exec()
  }
}
