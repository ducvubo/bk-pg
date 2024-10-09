import { Injectable } from '@nestjs/common'
import { BlogRepository } from './model/blog.repo'
import { CreateBlogDto } from './dto/create-blog.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { TagBlogRepository } from 'src/tag-blog/model/tag-blog.repo'

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly tagBlogRepository: TagBlogRepository
  ) {}

  async createBlog(createBlogDto: CreateBlogDto, account: IAccount) {
    const { blg_tag } = createBlogDto
    // Tìm tất cả các tag đã tồn tại dựa trên tên
    const existingTags = await this.tagBlogRepository.findTagsByName(blg_tag)
    // Lấy những tag chưa tồn tại
    const existingTagNames = existingTags.map((tag) => tag.tag_name)
    const newTagNames = blg_tag.filter((tag) => !existingTagNames.includes(tag))
    // Tạo mới những tag chưa tồn tại
    const newTags = await this.tagBlogRepository.createTags(newTagNames)

    // Lấy id của tất cả các tag (bao gồm cả tag đã tồn tại và tag mới tạo)
    const allTags = [...existingTags, ...newTags]
    const tagIds = allTags.map((tag) => String(tag._id))

    console.log('TagIds', tagIds)
    return await this.blogRepository.createBlog({ ...createBlogDto, blg_tag: tagIds }, account)
  }
}
