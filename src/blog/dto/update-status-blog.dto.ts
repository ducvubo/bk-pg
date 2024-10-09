import { IsIn, IsMongoId, IsNotEmpty } from 'class-validator'

export class UpdateStatusBlogDto {
  @IsNotEmpty({ message: 'Id không được để trống' })
  @IsMongoId({ message: 'Id phải là một ObjectId hợp lệ' })
  _id: string

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsIn(['draft', 'publish'], { message: 'Status phải là "draft", "publish"' })
  blg_status: 'draft' | 'publish'
}
