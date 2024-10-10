import { Module } from '@nestjs/common'
import { CommentBlogService } from './comment-blog.service'
import { CommentBlogController } from './comment-blog.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { CommentBlog, CommentBlogSchema } from './model/comment-blog.model'
import { CommentBlogRepository } from './model/comment-blog.repo'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: CommentBlog.name, schema: CommentBlogSchema }]), UsersModule],
  controllers: [CommentBlogController],
  providers: [CommentBlogService, CommentBlogRepository]
})
export class CommentBlogModule {}
