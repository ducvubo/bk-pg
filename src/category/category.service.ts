import { ConflictException, Injectable } from '@nestjs/common'
import { CategoryRepository } from './model/category.repo'
import { CreateCategoryDto } from './dto/create-category.dto'

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { category_name } = createCategoryDto
    const categoryExist = await this.categoryRepository.findOne({ category_name })
    if (categoryExist) throw new ConflictException(`Danh mục ${category_name} đã tồn tại`)
    return await this.categoryRepository.create({ category_name })
  }

  async findAll() {
    return await this.categoryRepository.findAll()
  }
}
