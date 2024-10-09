import { Injectable } from '@nestjs/common'
import { TagBlogRepository } from './model/tag-blog.repo'

@Injectable()
export class TagBlogService {
  constructor(private readonly tagBlogRepository: TagBlogRepository) {}
}
