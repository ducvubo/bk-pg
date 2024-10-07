import { Controller } from '@nestjs/common'
import { TagBlogService } from './tag-blog.service'

@Controller('tag-blog')
export class TagBlogController {
  constructor(private readonly tagBlogService: TagBlogService) {}
}
