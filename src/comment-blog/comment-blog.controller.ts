import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common'
import { CommentBlogService } from './comment-blog.service'
import { ResponseMessage, User } from 'src/decorator/customize'
import { UserAuthGuard } from 'src/guard/users.guard'
import { CreateCommentDto } from './dto/create-comment.dto'
import { IUser } from 'src/users/users.interface'
import { GetCommentDto } from './dto/get-comment.dto'
import { DeleteBlogDto } from './dto/delete-blog.dto'

@Controller('comment-blog')
export class CommentBlogController {
  constructor(private readonly commentBlogService: CommentBlogService) {}

  @Post()
  @ResponseMessage('Thêm comment thành công')
  @UseGuards(UserAuthGuard)
  async createCommentBlog(@Body() createCommentDto: CreateCommentDto, @User() user: IUser) {
    return await this.commentBlogService.createCommentBlog(createCommentDto, user)
  }

  @Get()
  @ResponseMessage('Lấy danh sách comment thành công')
  async getCommentsByBlogId(
    @Body()
    { cmt_blg_blog_id, cmt_blg_parentId, limit = 5, offset = 1 }: GetCommentDto
  ) {
    return await this.commentBlogService.getCommentsByBlogId({ cmt_blg_blog_id, cmt_blg_parentId, limit, offset })
  }

  @Delete()
  @ResponseMessage('Xóa comment thành công')
  async deleteCommentBlog(@Body() { cmt_blg_id, _id }: DeleteBlogDto) {
    return await this.commentBlogService.deleteCommentBlog({ cmt_blg_id, _id })
  }
}
