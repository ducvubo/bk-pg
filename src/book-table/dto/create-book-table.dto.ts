import { Type } from 'class-transformer'
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class Hour {
  @IsNotEmpty({ message: 'Giờ không được bỏ trống' })
  @IsString({ message: 'Giờ phải là chuỗi' })
  label: string

  @IsNotEmpty({ message: 'Giờ không được bỏ trống' })
  @IsNumber({}, { message: 'Giờ phải là số' })
  value: number
}

export class CreateBookTableDto {
  @IsString({ message: 'Id người dùng phải là chuỗi' })
  @IsOptional()
  book_tb_user_id?: string

  @IsString({ message: 'Id khách vãng phải là chuỗi' })
  @IsOptional()
  book_tb_guest_id?: string

  //nhà hàng
  @IsNotEmpty({ message: 'Id nhà hàng không được để trống' })
  @IsString({ message: 'Id nhà hàng phải là chuỗi' })
  book_tb_restaurant_id: string

  //email
  @IsNotEmpty({ message: 'Email người đặt không được để trống' })
  @IsString({ message: 'Email người đặt phải là chuỗi' })
  @IsEmail({}, { message: 'Email người đặt không đúng đ��nh dạng' })
  book_tb_email: string

  //sô điện thoại
  @IsNotEmpty({ message: 'Số điện thoại người đặt không được để trống' })
  @IsString({ message: 'Số điện thoại người đặt phải là chuỗi' })
  book_tb_phone: string

  //tên người đặt
  @IsNotEmpty({ message: 'Tên người đặt không được để trống' })
  @IsString({ message: 'Tên người đặt phải là chuỗi' })
  book_tb_name: string

  //ngày đặt
  @IsNotEmpty({ message: 'Ngày đặt không được để trống' })
  @IsDateString({}, { each: true })
  book_tb_date: Date

  //gi�� đặt
  @IsNotEmpty({ message: 'Giờ đặt không được để trống' })
  @ValidateNested()
  @Type(() => Hour)
  book_tb_hour: Hour

  //số người lơn
  @IsNotEmpty({ message: 'Số người lớn không được để trống' })
  @IsNumber({}, { message: 'Số người lớn phải là số' })
  book_tb_number_adults: number

  //số người tr�� em
  @IsNotEmpty({ message: 'Số người trẻ em không được để trống' })
  @IsNumber({}, { message: 'Số người trẻ em phải là số' })
  book_tb_number_children: number

  //thông tin thêm
  @IsOptional()
  @IsNotEmpty({ message: 'Thông tin thêm không được để trống' })
  @IsString({ message: 'Thông tin thêm phải là chuỗi' })
  book_tb_note: string

  //url redirect
  @IsNotEmpty({ message: 'Url redirect không được để trống' })
  @IsString({ message: 'Url redirect phải là chuỗi' })
  book_tb_redirect_url: string
}
