import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { BlogService } from './blog.service'
import { Acccount, ResponseMessage } from 'src/decorator/customize'
import { AccountAuthGuard } from 'src/guard/accounts.guard'
import { UserAuthGuard } from 'src/guard/users.guard'
import { CreateBlogDto } from './dto/create-blog.dto'
import { IAccount } from 'src/accounts/accounts.interface'

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ResponseMessage('Tao blog thanh cong')
  @UseGuards(AccountAuthGuard)
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Acccount() account: IAccount) {
    return await this.blogService.createBlog(createBlogDto, account)
  }

  @Post('tag')
  @ResponseMessage('Them tag cho blog thanh cong')
  @UseGuards(UserAuthGuard)
  createTag() {
    return
  }
}
