import { ConflictException, Injectable } from '@nestjs/common'
import { CategoryRepository } from './model/category.repo'
import { CreateCategoryDto } from './dto/create-category.dto'
import { IUser } from 'src/users/users.interface'
import { BadRequestError, NotFoundError } from 'src/utils/errorResponse'
import aqp from 'api-query-params'
import mongoose from 'mongoose'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { UpdateStatusCategoryDto } from './dto/update-status-category.dto'
import { CategoryDocument } from './model/category.model'

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto, user: IUser): Promise<CategoryDocument> {
    const { category_name } = createCategoryDto
    const categoryExist = await this.categoryRepository.findOneByName({ category_name })
    if (categoryExist) throw new ConflictException(`Danh mục ${category_name} đã tồn tại`)
    return await this.categoryRepository.create(createCategoryDto, user)
  }

  async findAll(): Promise<CategoryDocument[]> {
    return await this.categoryRepository.findAll()
  }

  async findAllPagination({
    currentPage = 1,
    limit = 10,
    qs
  }: {
    currentPage: number
    limit: number
    qs: string
  }): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: CategoryDocument[]
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

    const totalItems = await this.categoryRepository.totalItems(false)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    // const population = 'restaurant_category'

    const result = await this.categoryRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
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

  async findOne({ _id }: { _id: string }): Promise<CategoryDocument> {
    return await this.categoryRepository.findOneById({ _id })
  }

  async updateCategory(updateCategoryDto: UpdateCategoryDto, user: IUser): Promise<CategoryDocument> {
    const { _id } = updateCategoryDto
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Danh mục không tồn tại')
    const category = await this.categoryRepository.findOneById({ _id })
    if (!category) throw new NotFoundError('Danh mục không tồn tại')
    return await this.categoryRepository.updateCategory(updateCategoryDto, user)
  }

  async remove({ _id, user }: { _id: string; user: IUser }): Promise<CategoryDocument> {
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Danh mục không tồn tại')
    const category = await this.categoryRepository.findOneById({ _id })
    if (!category) throw new NotFoundError('Danh mục không tồn tại')
    return await this.categoryRepository.remove({ _id, user })
  }

  async findAllRecycle({
    currentPage = 1,
    limit = 10,
    qs
  }: {
    currentPage: number
    limit: number
    qs: string
  }): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: CategoryDocument[]
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

    const totalItems = await this.categoryRepository.totalItems(true)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    // const population = 'restaurant_category'

    const result = await this.categoryRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
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

  async restore({ _id, user }: { _id: string; user: IUser }): Promise<CategoryDocument> {
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Danh mục không tồn tại')
    const category = await this.categoryRepository.findOneById({ _id })
    if (!category) throw new NotFoundError('Danh mục không tồn tại')
    return await this.categoryRepository.restore({ _id, user })
  }

  async updateStatus(updateStatusCategoryDto: UpdateStatusCategoryDto, user: IUser): Promise<CategoryDocument> {
    const { _id } = updateStatusCategoryDto
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Danh mục không tồn tại')
    const category = await this.categoryRepository.findOneById({ _id })
    if (!category) throw new NotFoundError('Danh mục không tồn tại')
    return await this.categoryRepository.updateStatus(updateStatusCategoryDto, user)
  }

  async findCategoryHome({ limit = 10 }: { limit: number }): Promise<CategoryDocument[]> {
    return await this.categoryRepository.findCategoryHome({ limit })
  }
}
