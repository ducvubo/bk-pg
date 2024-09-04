import { Body, Controller, Get, Post } from '@nestjs/common'
import { CategoryService } from './category.service'
import { ResponseMessage } from 'src/decorator/customize'
import { CreateCategoryDto } from './dto/create-category.dto'

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ResponseMessage('Thêm danh mục thành công')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto)
  }

  @Get()
  @ResponseMessage('Lấy tất cả danh mục thành công')
  findAll() {
    return this.categoryService.findAll()
  }
}
