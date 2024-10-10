import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CommentBlog, CommentBlogDocument } from './comment-blog.model'
import { ImageUrl } from 'src/restaurants/dto/create-restaurant.dto'
import { NotFoundError } from 'src/utils/errorResponse'

@Injectable()
export class CommentBlogRepository {
  constructor(@InjectModel(CommentBlog.name) private commentBlogModel: Model<CommentBlogDocument>) {}

  async createCommentBlog({
    cmt_blg_blog_id,
    cmt_blg_content,
    cmt_blg_image,
    cmt_blg_parentId,
    cmt_blg_user_id
  }: {
    cmt_blg_blog_id: string
    cmt_blg_user_id: string
    cmt_blg_image?: ImageUrl[]
    cmt_blg_content: string
    cmt_blg_parentId?: string
  }) {
    const newCommentBlog = new this.commentBlogModel({
      cmt_blg_blog_id,
      cmt_blg_user_id,
      cmt_blg_image,
      cmt_blg_content,
      cmt_blg_parentId
    })

    let rightValue: number
    if (cmt_blg_parentId) {
      // trả lời comment
      const parentComment = await this.commentBlogModel.findById(cmt_blg_parentId)
      if (!parentComment) throw new NotFoundError('Comment không tồn tại')
      rightValue = parentComment.cmt_blg_right

      // cập nhật left và right value
      await this.commentBlogModel.updateMany(
        {
          cmt_blg_blog_id,
          cmt_blg_right: { $gte: rightValue }
        },
        {
          $inc: { cmt_blg_right: 2 }
        }
      )

      await this.commentBlogModel.updateMany(
        {
          cmt_blg_blog_id,
          cmt_blg_left: { $gt: rightValue }
        },
        {
          $inc: { cmt_blg_left: 2 }
        }
      )
    } else {
      // comment bài viết
      const maxRightValue = await this.commentBlogModel.findOne({ cmt_blg_blog_id }, 'cmt_blg_right', {
        sort: { cmt_blg_right: -1 }
      })
      if (maxRightValue) {
        rightValue = maxRightValue.cmt_blg_right + 1
      } else {
        rightValue = 1
      }
    }

    newCommentBlog.cmt_blg_left = rightValue
    newCommentBlog.cmt_blg_right = rightValue + 1

    await newCommentBlog.save()

    return newCommentBlog
  }

  async getCommentsByBlogId({
    cmt_blg_blog_id,
    cmt_blg_parentId = null,
    limit = 10,
    offset = 0
  }: {
    cmt_blg_blog_id: string
    cmt_blg_parentId?: string
    limit?: number
    offset?: number
  }) {
    if (cmt_blg_parentId) {
      const parentComment = await this.commentBlogModel.findById(cmt_blg_parentId)
      if (!parentComment) throw new NotFoundError('Comment không tồn tại')

      const comments = await this.commentBlogModel
        .find({
          cmt_blg_blog_id,
          cmt_blg_left: { $gt: parentComment.cmt_blg_left },
          cmt_blg_right: { $lte: parentComment.cmt_blg_right }
        })
        .select({
          cmt_blg_left: 1,
          cmt_blg_right: 1,
          cmt_blg_content: 1,
          cmt_blg_image: 1,
          cmt_blg_parentId: 1
        })
        .sort({ cmt_blg_left: 1 })
        .limit(limit)
        .skip(offset)

      return comments
    }

    const comments = await this.commentBlogModel
      .find({ cmt_blg_blog_id })
      .select({
        cmt_blg_left: 1,
        cmt_blg_right: 1,
        cmt_blg_content: 1,
        cmt_blg_image: 1,
        cmt_blg_parentId: 1
      })
      .sort({ cmt_blg_left: 1 })
      .limit(limit)
      .skip(offset)

    return comments
  }

  async deleteCommentBlog({ cmt_blg_id, _id }: { cmt_blg_id: string; _id: string }) {
    //check blog...

    // xác định giá trị left và right của comment
    const comment = await this.commentBlogModel.findById(_id)
    if (!comment) throw new NotFoundError('Comment không tồn tại')

    const leftValue = comment.cmt_blg_left
    const rightValue = comment.cmt_blg_right

    // tính witdh của comment
    const width = rightValue - leftValue + 1

    // xóa tất cả comment con
    await this.commentBlogModel.deleteMany({
      cmt_blg_blog_id: cmt_blg_id,
      cmt_blg_left: { $gte: leftValue, $lte: rightValue }
    })

    // cập nhật left và right của comment còn lại
    await this.commentBlogModel.updateMany(
      {
        cmt_blg_blog_id: cmt_blg_id,
        cmt_blg_right: { $gt: rightValue }
      },
      {
        $inc: { cmt_blg_right: -width }
      }
    )

    await this.commentBlogModel.updateMany(
      {
        cmt_blg_blog_id: cmt_blg_id,
        cmt_blg_left: { $gt: rightValue }
      },
      {
        $inc: { cmt_blg_left: -width }
      }
    )

    return true
  }
}
