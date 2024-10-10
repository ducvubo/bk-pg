import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class GetCommentDto {
  @IsNotEmpty({ message: 'Id blog không được để trống' })
  @IsMongoId({ message: 'Id blog không hợp lệ' })
  cmt_blg_blog_id: string

  @IsMongoId({ message: 'Id comment cha không hợp lệ' })
  @IsOptional()
  cmt_blg_parentId?: string

  @IsNumber({}, { message: 'Limit phải là số' })
  @IsOptional()
  limit?: number

  @IsNumber({}, { message: 'Offset phải là số' })
  @IsOptional()
  offset?: number
}
