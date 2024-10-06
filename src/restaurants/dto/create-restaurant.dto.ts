import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
  ValidateIf,
  ValidateNested
} from 'class-validator'

const HourValue = [
  { lable: '00:00', value: 1 },
  { label: '00:15', value: 2 },
  { label: '00:30', value: 3 },
  { label: '00:45', value: 4 },
  { label: '01:00', value: 5 },
  { label: '01:15', value: 6 },
  { label: '01:30', value: 7 },
  { label: '01:45', value: 8 },
  { label: '02:00', value: 9 },
  { label: '02:15', value: 10 },
  { label: '02:30', value: 11 },
  { label: '02:45', value: 12 },
  { label: '03:00', value: 13 },
  { label: '03:15', value: 14 },
  { label: '03:30', value: 15 },
  { label: '03:45', value: 16 },
  { label: '04:00', value: 17 },
  { label: '04:15', value: 18 },
  { label: '04:30', value: 19 },
  { label: '04:45', value: 20 },
  { label: '05:00', value: 21 },
  { label: '05:15', value: 22 },
  { label: '05:30', value: 23 },
  { label: '05:45', value: 24 },
  { label: '06:00', value: 25 },
  { label: '06:15', value: 26 },
  { label: '06:30', value: 27 },
  { label: '06:45', value: 28 },
  { label: '07:00', value: 29 },
  { label: '07:15', value: 30 },
  { label: '07:30', value: 31 },
  { label: '07:45', value: 32 },
  { label: '08:00', value: 33 },
  { label: '08:15', value: 34 },
  { label: '08:30', value: 35 },
  { label: '08:45', value: 36 },
  { label: '09:00', value: 37 },
  { label: '09:15', value: 38 },
  { label: '09:30', value: 39 },
  { label: '09:45', value: 40 },
  { label: '10:00', value: 41 },
  { label: '10:15', value: 42 },
  { label: '10:30', value: 43 },
  { label: '10:45', value: 44 },
  { label: '11:00', value: 45 },
  { label: '11:15', value: 46 },
  { label: '11:30', value: 47 },
  { label: '11:45', value: 48 },
  { label: '12:00', value: 49 },
  { label: '12:15', value: 50 },
  { label: '12:30', value: 51 },
  { label: '12:45', value: 52 },
  { label: '13:00', value: 53 },
  { label: '13:15', value: 54 },
  { label: '13:30', value: 55 },
  { label: '13:45', value: 56 },
  { label: '14:00', value: 57 },
  { label: '14:15', value: 58 },
  { label: '14:30', value: 59 },
  { label: '14:45', value: 60 },
  { label: '15:00', value: 61 },
  { label: '15:15', value: 62 },
  { label: '15:30', value: 63 },
  { label: '15:45', value: 64 },
  { label: '16:00', value: 65 },
  { label: '16:15', value: 66 },
  { label: '16:30', value: 67 },
  { label: '16:45', value: 68 },
  { label: '17:00', value: 69 },
  { label: '17:15', value: 70 },
  { label: '17:30', value: 71 },
  { label: '17:45', value: 72 },
  { label: '18:00', value: 73 },
  { label: '18:15', value: 74 },
  { label: '18:30', value: 75 },
  { label: '18:45', value: 76 },
  { label: '19:00', value: 77 },
  { label: '19:15', value: 78 },
  { label: '19:30', value: 79 },
  { label: '19:45', value: 80 },
  { label: '20:00', value: 81 },
  { label: '20:15', value: 82 },
  { label: '20:30', value: 83 },
  { label: '20:45', value: 84 },
  { label: '21:00', value: 85 },
  { label: '21:15', value: 86 },
  { label: '21:30', value: 87 },
  { label: '21:45', value: 88 },
  { label: '22:00', value: 89 },
  { label: '22:15', value: 90 },
  { label: '22:30', value: 91 },
  { label: '22:45', value: 92 },
  { label: '23:00', value: 93 },
  { label: '23:15', value: 94 },
  { label: '23:30', value: 95 },
  { label: '23:45', value: 96 },
  { label: '23:59', value: 97 }
]
const HourValueArr = HourValue.map((item) => item.value)

export const validDaysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']

class Address {
  @IsNotEmpty({ message: 'ID không được để trống' })
  @IsString({ message: 'ID phải là một chuỗi' })
  value: string

  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString({ message: 'Tên phải là một chuỗi' })
  name: string
}

class RestaurantAddress {
  @IsNotEmpty({ message: 'Tỉnh/thành không được để trống' })
  @ValidateNested()
  @Type(() => Address)
  address_province: Address

  @IsNotEmpty({ message: 'Quận/huyện không được để trống' })
  @ValidateNested()
  @Type(() => Address)
  address_district: Address

  @IsNotEmpty({ message: 'Xã/phường không được để trống' })
  @ValidateNested()
  @Type(() => Address)
  address_ward: Address

  @IsNotEmpty({ message: 'Địa chỉ cụ thể không được để trống' })
  @IsString({ message: 'Địa chỉ cụ thể phải là một chuỗi' })
  address_specific: string
}

class RestaurantPrice {
  @IsNotEmpty({ message: 'Loại giá tiền không được để trống' })
  @IsString({ message: 'Loại giá tiền phải là chuỗi' })
  restaurant_price_option: 'range' | 'down' | 'up'

  @IsNumber({}, { message: 'Giá tiền nhỏ nhất phải là số' })
  @ValidateIf((o) => o.option === 'range')
  @IsNotEmpty({ message: 'Giá nhỏ không được để trống khi lựa chọn là khoảng.' })
  @ValidateNested()
  restaurant_price_min?: number

  @IsNumber({}, { message: 'Giá tiền lớn nhất phải là số' })
  @ValidateIf((o) => o.option === 'range')
  @IsNotEmpty({ message: 'Giá lớn không được để trống khi lựa chọn là khoảng.' })
  @ValidateNested()
  restaurant_price_max?: number

  @IsNumber({}, { message: 'Giá tiền phải là số' })
  @ValidateIf((o) => o.option === 'down')
  @ValidateIf((o) => o.option === 'up')
  @IsNotEmpty({ message: 'Giá không được để trống khi lựa chọn là trên hoặc dưới.' })
  @ValidateNested()
  restaurant_price_amount?: number
}

export class ImageUrl {
  @IsNotEmpty({ message: 'Vui lòng tải ảnh lên1' })
  @IsString({ message: 'Vui lòng tải ảnh lên2' })
  image_cloud: string

  @IsNotEmpty({ message: 'Vui lòng tải ảnh lên3' })
  @IsString({ message: 'Vui lòng tải ảnh lên4' })
  image_custom: string
}

export class RestaurantHours {
  @IsNotEmpty({ message: 'Thứ không được để trống' })
  @IsString({ message: 'Thứ phải là dạng chuỗi' })
  @IsIn(validDaysOfWeek, { message: 'Thứ phải là các ngày trong tuần' })
  day_of_week: string

  @IsNotEmpty({ message: 'Giờ mở cửa không được để trống' })
  @IsIn(HourValueArr, { message: 'Giờ mở cửa phải là một trong các giá trị hợp lệ' })
  open: number

  @IsNotEmpty({ message: 'Giờ đóng cửa không được để trống' })
  @IsIn(HourValueArr, { message: 'Giờ mở cửa phải là một trong các giá trị hợp lệ' })
  close: number
}

export class CreateRestaurantDto {
  @IsNotEmpty({ message: 'Email nhà hàng không được để trống' })
  @IsString({ message: 'Email nhà hàng phải là chuuỗi' })
  @IsEmail({}, { message: 'Email nhà hàng không đúng đ��nh dạng' })
  restaurant_email: string

  // Mật khẩu
  @IsNotEmpty({ message: 'Mật khẩu nhà hàng không được để trống' })
  @IsString({ message: 'Mật khẩu nhà hàng phải là chuuỗi' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt, và dài ít nhất 8 ký tự'
    }
  )
  restaurant_password: string

  // Số điện thoại
  @IsNotEmpty({ message: 'Số điện thoại nhà hàng không được để trống' })
  @IsString({ message: 'Số điện thoại nhà hàng phải là chuuỗi' })
  // @IsPhoneNumber('VN', { message: 'Số điện thoại nhà hàng không đúng đây định dạng' })
  restaurant_phone: string

  @IsNotEmpty({ message: 'Danh mục nhà hàng không được để trống' })
  @IsString({ message: 'Danh mục nhà hàng phải là chuỗi' })
  restaurant_category: string

  // Tên nhà hàng
  @IsNotEmpty({ message: 'Tên nhà hàng không được để trống' })
  @IsString({ message: 'Tên nhà hàng phải là chuỗi' })
  restaurant_name: string

  //Ảnh bìa
  @IsNotEmpty({ message: 'Ảnh banner không được để trống' })
  @ValidateNested()
  @Type(() => ImageUrl)
  restaurant_banner: ImageUrl

  //Địa chỉ
  @IsNotEmpty({ message: 'Địa chỉ nhà hàng không được để trống' })
  @ValidateNested()
  @Type(() => RestaurantAddress)
  restaurant_address: RestaurantAddress

  //Loại hình
  @IsNotEmpty({ message: 'Loại hình nhà hàng không được để trống' })
  @IsArray({ message: 'Loại hình nhà hàng phải là mảng' })
  restaurant_type: string[]

  //Khoảng giá
  @IsNotEmpty({ message: 'Khoảng giá không được để trống' })
  @ValidateNested()
  @Type(() => RestaurantPrice)
  restaurant_price: RestaurantPrice

  //Giờ hoạt động
  @IsNotEmpty({ message: 'Giờ hoạt động không được để trống' })
  @ArrayMaxSize(7, { message: 'Giờ hoạt động tối đa có 7 mục' })
  @ValidateNested()
  @Type(() => RestaurantHours)
  restaurant_hours: RestaurantHours[]

  //Tóm tắt
  @IsNotEmpty({ message: 'Tóm tắt không được để trống' })
  @IsString({ message: 'Tóm tắt phải là chuỗi' })
  restaurant_overview: string

  // Tiện ích
  @IsNotEmpty({ message: 'Tiện ích không được để trống' })
  @IsArray({ message: 'Tiện ích phải là mảng' })
  restaurant_amenity: string[]

  //Hình ảnh nhà hàng
  @IsNotEmpty({ message: 'Hình ảnh nhà hàng không được để trống' })
  @ValidateNested()
  @Type(() => ImageUrl)
  restaurant_image: ImageUrl[]

  //Mô tả nhà hàng
  @IsNotEmpty({ message: 'Mô tả nhà hàng không được để trống' })
  @IsString({ message: 'Mô tả nhà hàng phải là chuỗi' })
  restaurant_description: string
}
