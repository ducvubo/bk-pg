import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CategoryService } from './category.service'
import { ResponseMessage, User } from 'src/decorator/customize'
import { CreateCategoryDto } from './dto/create-category.dto'

import { UserAuthGuard } from 'src/guard/users.guard'
import { IUser } from 'src/users/users.interface'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { UpdateStatusCategoryDto } from './dto/update-status-category.dto'

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ResponseMessage('Thêm danh mục thành công')
  @UseGuards(UserAuthGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto, @User() user: IUser) {
    return this.categoryService.create(createCategoryDto, user)
  }

  @Get()
  @ResponseMessage('Lấy tất cả danh mục thành công')
  @UseGuards(UserAuthGuard)
  findAll() {
    return this.categoryService.findAll()
  }

  @Patch()
  @ResponseMessage('Cập nhật danh mục thành công')
  @UseGuards(UserAuthGuard)
  async updateCategory(@Body() updateCategoryDto: UpdateCategoryDto, @User() user: IUser) {
    return this.categoryService.updateCategory(updateCategoryDto, user)
  }

  @Get('/home')
  @ResponseMessage('Lấy danh mục trang chủ thành công')
  async findCategoryHome(@Query('limit') limit: number) {
    return this.categoryService.findCategoryHome({ limit })
  }

  @Get('/pagination')
  @ResponseMessage('Lấy tất cả danh mục thành công')
  @UseGuards(UserAuthGuard)
  findAllPagination(@Query('current') currentPage: string, @Query('pageSize') limit: string, @Query() qs: string) {
    return this.categoryService.findAllPagination({ currentPage: +currentPage, limit: +limit, qs })
  }

  @Get('/recycle')
  @ResponseMessage('Lấy tất cả danh mục đã xóa thành công')
  @UseGuards(UserAuthGuard)
  findAllRecycle(@Query('current') currentPage: string, @Query('pageSize') limit: string, @Query() qs: string) {
    return this.categoryService.findAllRecycle({ currentPage: +currentPage, limit: +limit, qs })
  }

  @Patch('/restore/:id')
  @ResponseMessage('Khôi phục danh mục thành công')
  @UseGuards(UserAuthGuard)
  async restore(@Param('id') _id: string, @User() user: IUser) {
    return this.categoryService.restore({ _id, user })
  }

  @Patch('/update-status')
  @ResponseMessage('Cập nhật trạng thái danh mục thành công')
  @UseGuards(UserAuthGuard)
  async updateStatus(@Body() updateStatusCategoryDto: UpdateStatusCategoryDto, @User() user: IUser) {
    return this.categoryService.updateStatus(updateStatusCategoryDto, user)
  }

  @Delete('/:id')
  @ResponseMessage('Xóa danh mục thành công')
  @UseGuards(UserAuthGuard)
  async remove(@Param('id') _id: string, @User() user: IUser) {
    return this.categoryService.remove({ _id, user })
  }

  @Get('/:id')
  @ResponseMessage('Lấy chi tiết danh mục thành công')
  @UseGuards(UserAuthGuard)
  findOne(@Param('id') _id: string) {
    return this.categoryService.findOne({ _id })
  }
}
