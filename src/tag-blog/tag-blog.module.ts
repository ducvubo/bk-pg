import { Module } from '@nestjs/common'
import { TagBlogService } from './tag-blog.service'
import { TagBlogController } from './tag-blog.controller'
import { TagBlog, TagBlogSchema } from './model/tag-blog.model'
import { MongooseModule } from '@nestjs/mongoose'
import { TagBlogRepository } from './model/tag-blog.repo'

@Module({
  imports: [MongooseModule.forFeature([{ name: TagBlog.name, schema: TagBlogSchema }])],
  controllers: [TagBlogController],
  providers: [TagBlogService, TagBlogRepository],
  exports: [TagBlogService, TagBlogRepository]
})
export class TagBlogModule {}
