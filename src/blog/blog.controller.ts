import { Body, Controller, Post, Query, UseGuards, Get, Param, Patch, Delete } from '@nestjs/common'
import { BlogService } from './blog.service'
import { Acccount, ResponseMessage } from 'src/decorator/customize'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { UserAuthGuard } from 'src/guard/users.guard'
import { CreateBlogDto } from './dto/create-blog.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateBlogDto } from './dto/update-blog.dto'
import { UpdateStatusBlogDto } from './dto/update-status-blog.dto'
import { BlogDocument } from './model/blog.model'

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ResponseMessage('Tạo blog thành công')
  @UseGuards(AccountAuthGuard)
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Acccount() account: IAccount): Promise<BlogDocument> {
    return await this.blogService.createBlog(createBlogDto, account)
  }

  @Get()
  @ResponseMessage('Lay danh sách blog của nhà hàng thành công')
  @UseGuards(AccountAuthGuard)
  async getBlogByRestaurant(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: BlogDocument[]
  }> {
    return await this.blogService.getBlogByRestaurant({ currentPage: +currentPage, limit: +limit, qs }, account)
  }

  @Patch()
  @ResponseMessage('Cập nhật blog thành công')
  @UseGuards(AccountAuthGuard)
  async updateBlog(@Body() updateBlogDto: UpdateBlogDto, @Acccount() account: IAccount): Promise<BlogDocument> {
    return await this.blogService.updateBlog(updateBlogDto, account)
  }

  @Get('/recycle')
  @ResponseMessage('Lấy danh sách blog đã xóa thành công')
  @UseGuards(AccountAuthGuard)
  async getBlogRecycle(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @Acccount() account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: BlogDocument[]
  }> {
    return await this.blogService.getBlogRecycle({ currentPage: +currentPage, limit: +limit, qs }, account)
  }

  @Patch('/update-status')
  @ResponseMessage('Cập nhật trạng thái blog thành công')
  @UseGuards(AccountAuthGuard)
  async updateStatusBlog(
    @Body() updateStatusBlogDto: UpdateStatusBlogDto,
    @Acccount() account: IAccount
  ): Promise<BlogDocument> {
    return await this.blogService.updateStatusBlog(updateStatusBlogDto, account)
  }

  @Patch('/restore/:id')
  @ResponseMessage('Khôi phục blog thành công')
  @UseGuards(AccountAuthGuard)
  async restoreBlog(@Param('id') _id: string, @Acccount() account: IAccount): Promise<BlogDocument> {
    return await this.blogService.restoreBlog(_id, account)
  }

  @Delete('/:id')
  @ResponseMessage('Xóa blog thành công')
  @UseGuards(AccountAuthGuard)
  async deleteBlog(@Param('id') _id: string, @Acccount() account: IAccount): Promise<BlogDocument> {
    return await this.blogService.deleteBlog(_id, account)
  }

  @Get('/:id')
  @ResponseMessage('Lấy thông tin blog thành công')
  @UseGuards(AccountAuthGuard)
  async getBlogById(@Param('id') _id: string, @Acccount() account: IAccount): Promise<BlogDocument> {
    return await this.blogService.getBlogById(_id, account)
  }

  @Post('tag')
  @ResponseMessage('Tạo tag thành công')
  @UseGuards(UserAuthGuard)
  createTag(): void {
    return
  }
}
