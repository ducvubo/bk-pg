import { IsMongoId, IsNotEmpty } from 'class-validator'

export class DeleteBlogDto {
  @IsNotEmpty({ message: 'Id comment không được để trống' })
  @IsMongoId({ message: 'Id comment không hợp lệ' })
  _id: string

  @IsNotEmpty({ message: 'Id blog không được để trống' })
  @IsMongoId({ message: 'Id blog không hợp lệ' })
  cmt_blg_id: string
}
