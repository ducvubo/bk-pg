import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Blog, BlogDocument } from './blog.model'
import { CreateBlogDto } from '../dto/create-blog.dto'
import { IAccount } from 'src/accounts/accounts.interface'

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
}
