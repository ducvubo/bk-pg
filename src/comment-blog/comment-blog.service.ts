import { Injectable } from '@nestjs/common'
import { CommentBlogRepository } from './model/comment-blog.repo'
import { CreateCommentDto } from './dto/create-comment.dto'
import { IUser } from 'src/users/users.interface'
import mongoose from 'mongoose'
import { BadRequestError } from 'src/utils/errorResponse'
import { GetCommentDto } from './dto/get-comment.dto'
import { DeleteBlogDto } from './dto/delete-blog.dto'
import { CommentBlogDocument } from './model/comment-blog.model'

@Injectable()
export class CommentBlogService {
  constructor(private readonly commentBlogRepository: CommentBlogRepository) {}

  async createCommentBlog(createCommentDto: CreateCommentDto, user: IUser): Promise<CommentBlogDocument> {
    return await this.commentBlogRepository.createCommentBlog({ ...createCommentDto, cmt_blg_user_id: user._id })
  }

  async getCommentsByBlogId({
    cmt_blg_blog_id,
    cmt_blg_parentId = null,
    limit = 10,
    offset = 0
  }: GetCommentDto): Promise<CommentBlogDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(cmt_blg_blog_id)) throw new BadRequestError('Id blog không hợp lệ')
    if (cmt_blg_parentId && !mongoose.Types.ObjectId.isValid(cmt_blg_parentId))
      throw new BadRequestError('Id comment cha không hợp lệ')

    return await this.commentBlogRepository.getCommentsByBlogId({ cmt_blg_blog_id, cmt_blg_parentId, limit, offset })
  }

  async deleteCommentBlog({ cmt_blg_id, _id }: DeleteBlogDto): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(cmt_blg_id)) throw new BadRequestError('Id comment không hợp lệ')

    return await this.commentBlogRepository.deleteCommentBlog({ cmt_blg_id, _id })
  }
}
