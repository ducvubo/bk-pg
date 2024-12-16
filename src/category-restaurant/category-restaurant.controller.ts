import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CategoryRestaurantService } from './category-restaurant.service'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { Acccount, ResponseMessage } from 'src/decorator/customize'
import { CreateCategoryRestaurantDto } from './dto/create-catgory-restaurant.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { CategoryRestaurantDocument } from './model/category-restaurant.model'
import { UpdateCategoryRestaurantDto } from './dto/update-category-restaurant.dto'
import { UpdateStatusCatResDto } from './dto/update-status-cat-res.dto'

@Controller('category-restaurant')
export class CategoryRestaurantController {
  constructor(private readonly categoryRestaurantService: CategoryRestaurantService) {}

  @Post()
  @UseGuards(AccountAuthGuard)
  @ResponseMessage('Tạo danh mục cho nhà hàng thành công')
  async createCategoryRestaurant(
    @Body() createCategoryRestaurantDto: CreateCategoryRestaurantDto,
    @Acccount() account: IAccount
  ): Promise<CategoryRestaurantDocument> {
    return await this.categoryRestaurantService.createCategoryRestaurant(createCategoryRestaurantDto, account)
  }

  @Get()
  @UseGuards(AccountAuthGuard)
  @ResponseMessage('Lấy tất cả danh mục của nhà hàng thành công')
  async findAllPagination(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: CategoryRestaurantDocument[]
  }> {
    return await this.categoryRestaurantService.findAllPagination(
      { currentPage: +currentPage, limit: +limit, qs },
      account
    )
  }

  @Patch()
  @UseGuards(AccountAuthGuard)
  @ResponseMessage('Cập nhật danh mục nhà hàng thành công')
  async updateCategoryRestaurant(
    @Body() updateCategoryRestaurantDto: UpdateCategoryRestaurantDto,
    @Acccount() account: IAccount
  ): Promise<CategoryRestaurantDocument> {
    return await this.categoryRestaurantService.updateCategoryRestaurant(updateCategoryRestaurantDto, account)
  }

  @Patch('restore/:id')
  @UseGuards(AccountAuthGuard)
  @ResponseMessage('Khôi phục danh mục nhà hàng thành công')
  async restoreCategoryRestaurant(
    @Acccount() account: IAccount,
    @Param('id') id: string
  ): Promise<CategoryRestaurantDocument> {
    return await this.categoryRestaurantService.restoreCategoryRestaurant(id, account)
  }

  @Patch('update-status')
  @UseGuards(AccountAuthGuard)
  @ResponseMessage('Cập nhật trạng thái danh mục nhà hàng thành công')
  async updateStatusCategoryRestaurant(
    @Body() updateStatusCatResDto: UpdateStatusCatResDto,
    @Acccount() account: IAccount
  ): Promise<CategoryRestaurantDocument> {
    return await this.categoryRestaurantService.updateStatusCategoryRestaurant(updateStatusCatResDto, account)
  }

  @Get('/recycle')
  @ResponseMessage('Lấy danh sách danh mục đã xóa thành công')
  @UseGuards(AccountAuthGuard)
  async findAllRecycle(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: CategoryRestaurantDocument[]
  }> {
    return await this.categoryRestaurantService.findAllRecycle(
      { currentPage: +currentPage, limit: +limit, qs },
      account
    )
  }

  @Delete('/:id')
  @UseGuards(AccountAuthGuard)
  @ResponseMessage('Xóa danh mục nhà hàng thành công')
  async deleteCategoryRestaurant(
    @Acccount() account: IAccount,
    @Param('id') id: string
  ): Promise<CategoryRestaurantDocument> {
    return await this.categoryRestaurantService.deleteCategoryRestaurant(id, account)
  }

  @Get('/:id')
  @UseGuards(AccountAuthGuard)
  @ResponseMessage('Lấy thông tin danh mục nhà hàng thành công')
  async findOneById(@Acccount() account: IAccount, @Param('id') id: string): Promise<CategoryRestaurantDocument> {
    return await this.categoryRestaurantService.findOneById(id, account)
  }
}
