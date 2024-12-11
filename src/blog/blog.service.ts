import { Injectable } from '@nestjs/common'
import { BlogRepository } from './model/blog.repo'
import { CreateBlogDto } from './dto/create-blog.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { TagBlogRepository } from 'src/tag-blog/model/tag-blog.repo'
import { BadRequestError } from 'src/utils/errorResponse'
import aqp from 'api-query-params'
import { UpdateBlogDto } from './dto/update-blog.dto'
import { UpdateStatusBlogDto } from './dto/update-status-blog.dto'
import mongoose from 'mongoose'
import { BlogDocument } from './model/blog.model'

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly tagBlogRepository: TagBlogRepository
  ) {}

  async createBlog(createBlogDto: CreateBlogDto, account: IAccount): Promise<BlogDocument> {
    const { blg_tag } = createBlogDto
    // Tìm tất cả các tag đã tồn tại dựa trên tên
    const existingTags = await this.tagBlogRepository.findTagsByName(blg_tag)
    // Lấy những tag chưa tồn tại
    const existingTagNames = existingTags.map((tag) => tag.tag_name)
    const newTagNames = blg_tag.filter((tag) => !existingTagNames.includes(tag))
    // Tạo mới những tag chưa tồn tại
    const newTags = await this.tagBlogRepository.createTags(newTagNames)

    // Lấy id của tất cả các tag (bao gồm cả tag đã tồn tại và tag mới tạo)
    const allTags = [...existingTags, ...newTags]
    const tagIds = allTags.map((tag) => String(tag._id))

    return await this.blogRepository.createBlog({ ...createBlogDto, blg_tag: tagIds }, account)
  }

  async getBlogByRestaurant(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: BlogDocument[]
  }> {
    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 10 : limit

    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }

    const { filter, sort, population } = aqp(qs)

    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10

    const totalItems = await this.blogRepository.totalItems(account, false)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    // const population = 'restaurant_category'

    const result = await this.blogRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
      account,
      false
    )

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        totalPage: totalPages,
        totalItem: totalItems
      },
      result
    }
  }

  async getBlogById(_id: string, account: IAccount): Promise<BlogDocument> {
    if (!_id) throw new BadRequestError('Blog này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(_id) === false) throw new BadRequestError('Blog này không tồn tại')
    return await this.blogRepository.getBlogById(_id, account)
  }

  async updateBlog(updateBlogDto: UpdateBlogDto, account: IAccount): Promise<BlogDocument> {
    const { blg_tag } = updateBlogDto
    // Tìm tất cả các tag đã tồn tại dựa trên tên
    const existingTags = await this.tagBlogRepository.findTagsByName(blg_tag)
    // Lấy những tag chưa tồn tại
    const existingTagNames = existingTags.map((tag) => tag.tag_name)
    const newTagNames = blg_tag.filter((tag) => !existingTagNames.includes(tag))
    // Tạo mới những tag chưa tồn tại
    const newTags = await this.tagBlogRepository.createTags(newTagNames)

    // Lấy id của tất cả các tag (bao gồm cả tag đã tồn tại và tag mới tạo)
    const allTags = [...existingTags, ...newTags]
    const tagIds = allTags.map((tag) => String(tag._id))

    const blogExist = await this.blogRepository.getBlogById(updateBlogDto._id, account)
    if (!blogExist) {
      throw new BadRequestError('Blog không tồn tại')
    }
    return await this.blogRepository.updateBlog({ ...updateBlogDto, blg_tag: tagIds }, account)
  }

  async updateStatusBlog(updateStatusBlogDto: UpdateStatusBlogDto, account: IAccount): Promise<BlogDocument> {
    const blogExist = await this.blogRepository.getBlogById(updateStatusBlogDto._id, account)
    if (!blogExist) {
      throw new BadRequestError('Blog không tồn tại')
    }
    return await this.blogRepository.updateStatusBlog(updateStatusBlogDto, account)
  }

  async deleteBlog(_id: string, account: IAccount): Promise<BlogDocument> {
    if (!_id) throw new BadRequestError('Blog này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(_id) === false) throw new BadRequestError('Blog này không tồn tại')
    const blogExist = await this.blogRepository.getBlogById(_id, account)
    if (!blogExist) {
      throw new BadRequestError('Blog không tồn tại')
    }
    return await this.blogRepository.deleteBlog(_id, account)
  }

  async restoreBlog(_id: string, account: IAccount): Promise<BlogDocument> {
    if (!_id) throw new BadRequestError('Blog này không tồn tại')
    if (mongoose.Types.ObjectId.isValid(_id) === false) throw new BadRequestError('Blog này không tồn tại')
    const blogExist = await this.blogRepository.getBlogById(_id, account)
    if (!blogExist) {
      throw new BadRequestError('Blog không tồn tại')
    }
    return await this.blogRepository.restoreBlog(_id, account)
  }

  async getBlogRecycle(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: BlogDocument[]
  }> {
    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 10 : limit

    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }

    const { filter, sort, population } = aqp(qs)

    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10

    const totalItems = await this.blogRepository.totalItems(account, true)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.blogRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
      account,
      true
    )

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        totalPage: totalPages,
        totalItem: totalItems
      },
      result
    }
  }
}
