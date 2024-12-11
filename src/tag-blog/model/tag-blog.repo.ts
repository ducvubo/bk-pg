import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { TagBlog, TagBlogDocument } from './tag-blog.model'

@Injectable()
export class TagBlogRepository {
  constructor(@InjectModel(TagBlog.name) private tagBlogModel: Model<TagBlogDocument>) {}

  async findTagsByName(tagNames: string[]): Promise<TagBlogDocument[]> {
    return this.tagBlogModel.find({ tag_name: { $in: tagNames } })
  }

  async createTags(tagNames: string[]): Promise<TagBlogDocument[]> {
    const newTags = tagNames.map((tag_name) => ({ tag_name }))
    return this.tagBlogModel.insertMany(newTags)
  }
}
