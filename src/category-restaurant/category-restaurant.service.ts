import { Injectable } from '@nestjs/common'
import { CategoryRestauranRepository } from './model/category-restaurant.repo'
import { CreateCategoryRestaurantDto } from './dto/create-catgory-restaurant.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { generateSlug } from 'src/utils'
import { BadRequestError } from 'src/utils/errorResponse'
import { CategoryRestaurantDocument } from './model/category-restaurant.model'
import aqp from 'api-query-params'
import { UpdateCategoryRestaurantDto } from './dto/update-category-restaurant.dto'
import { UpdateStatusCatResDto } from './dto/update-status-cat-res.dto'

@Injectable()
export class CategoryRestaurantService {
  constructor(private readonly categoryRestauranRepository: CategoryRestauranRepository) {}

  async createCategoryRestaurant(
    createCategoryRestaurantDto: CreateCategoryRestaurantDto,
    account: IAccount
  ): Promise<CategoryRestaurantDocument> {
    const cat_res_slug: string = generateSlug(createCategoryRestaurantDto.cat_res_name)

    return await this.categoryRestauranRepository.createCategoryRestaurant(
      { ...createCategoryRestaurantDto, cat_res_slug: cat_res_slug },
      account
    )
  }

  async findAllPagination(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: CategoryRestaurantDocument[]
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

    const totalItems = await this.categoryRestauranRepository.totalItems(account, false)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.categoryRestauranRepository.findAllPagination(
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

  async findAllRecycle(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: CategoryRestaurantDocument[]
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

    const totalItems = await this.categoryRestauranRepository.totalItems(account, true)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.categoryRestauranRepository.findAllPagination(
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

  async findOneById(id: string, account: IAccount): Promise<CategoryRestaurantDocument> {
    const categoryExits = await this.categoryRestauranRepository.findOneById(id, account)
    if (!categoryExits) {
      throw new BadRequestError('Danh mục không tồn tại')
    }

    return categoryExits
  }

  async updateCategoryRestaurant(
    updateCategoryRestaurantDto: UpdateCategoryRestaurantDto,
    account: IAccount
  ): Promise<CategoryRestaurantDocument> {
    const { _id } = updateCategoryRestaurantDto

    const categoryExits = await this.categoryRestauranRepository.findOneById(_id, account)
    if (!categoryExits) {
      throw new BadRequestError('Danh mục không tồn tại')
    }
    return await this.categoryRestauranRepository.updateCategoryRestaurant(updateCategoryRestaurantDto, account)
  }

  async deleteCategoryRestaurant(id: string, account: IAccount): Promise<CategoryRestaurantDocument> {
    const categoryExits = await this.categoryRestauranRepository.findOneById(id, account)
    if (!categoryExits) {
      throw new BadRequestError('Danh mục không tồn tại')
    }

    return await this.categoryRestauranRepository.deleteCategoryRestaurant(id, account)
  }

  async restoreCategoryRestaurant(id: string, account: IAccount): Promise<CategoryRestaurantDocument> {
    const categoryExits = await this.categoryRestauranRepository.findOneById(id, account)
    if (!categoryExits) {
      throw new BadRequestError('Danh mục không tồn tại')
    }

    return await this.categoryRestauranRepository.restoreCategoryRestaurant(id, account)
  }

  async updateStatusCategoryRestaurant(
    updateStatusCatResDto: UpdateStatusCatResDto,
    account: IAccount
  ): Promise<CategoryRestaurantDocument> {
    const { _id } = updateStatusCatResDto

    const categoryExits = await this.categoryRestauranRepository.findOneById(_id, account)
    if (!categoryExits) {
      throw new BadRequestError('Danh mục không tồn tại')
    }

    return await this.categoryRestauranRepository.updateStatusCategoryRestaurant(updateStatusCatResDto, account)
  }
}
