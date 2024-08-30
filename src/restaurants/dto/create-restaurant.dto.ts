import { Type } from 'class-transformer'
import { IsArray, IsDate, IsEmpty, IsNotEmpty, IsNumber, IsString, ValidateIf, ValidateNested } from 'class-validator'

class RestaurantPrice {
  @IsEmpty({ message: 'Loại giá tiền không được để trống' })
  @IsString({ message: 'Loại giá tiền phải là chu��i' })
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
  @IsEmpty({ message: 'Link ảnh cloud không được để trống' })
  @IsString({ message: 'Link ảnh cloud phải là chu��i' })
  image_cloud: string

  @IsEmpty({ message: 'Link ảnh tùy chỉnh không được để trống' })
  @IsString({ message: 'Link ảnh tùy chỉnh phải là chu��i' })
  image_custom: string
}

class RestaurantHours {
  @IsEmpty({ message: 'Thứ không được để trống' })
  @IsDate({ message: 'Thứ phải là các ngày trong tuần' })
  day_of_week: Date

  @IsEmpty({ message: 'Giờ mở cửa không được để trống' })
  @IsDate({ message: 'Gi�� mở cửa phải là th��i gian' })
  open: Date

  @IsEmpty({ message: 'Giờ đóng cửa không được để trống' })
  @IsDate({ message: 'Gi�� đóng cửa phải là th��i gian' })
  close: Date
}

export class MarkDown {
  @IsEmpty({ message: 'Markdown text không được để trống' })
  @IsString({ message: 'Markdown text phải là chu��i' })
  markdown_text: string

  @IsEmpty({ message: 'Markdown html không được để trống' })
  @IsString({ message: 'Markdown html phải là chu��i' })
  markdown_html: string
}

class RestaurantPropose {
  //Tư vấn-giữ chỗ
  @IsEmpty({ message: 'Tư vấn-giữ chỗ không được để trống' })
  @ValidateNested()
  @Type(() => MarkDown)
  propose_consultation_reservation: MarkDown

  //Ưu đãi tặng kèm
  @IsEmpty({ message: 'Ưu đãi tặng kèm không được để trống' })
  @ValidateNested()
  @Type(() => MarkDown)
  propose_bundled_offer: MarkDown

  //Lưu ý
  @IsEmpty({ message: 'Lưu ý không được để trống' })
  @ValidateNested()
  @Type(() => MarkDown)
  propose_note: MarkDown
}

class RestaurantOverview {
  //Phù hợp
  @IsArray({ message: 'Phù hợp phải là mảng' })
  overview_suitable: string[]

  //Món đặc sắc
  @IsArray({ message: 'Món đặc sắc phải là mảng' })
  overview_specialty_dish: string[]

  //Không gian
  @IsEmpty({ message: 'Không gian không được để trống' })
  overview_space: string[]

  //Để xe
  @IsArray({ message: 'Để xe phải là mảng' })
  overview_parking_area: string[]

  //Đặc trưng
  @IsArray({ message: 'Đặc trưng phải là mảng' })
  overview_characteristic: string[]
}

class RestaurantPriceMenu {
  // Tên món ăn
  @IsEmpty({ message: 'Tên món ăn không được để trống' })
  @IsString({ message: 'Tên món ăn phải là chuỗi' })
  price_menu_name: string

  // Đi kèm
  @IsString({ message: 'Đi kèm phải là chuỗi' }) q
  price_menu_detail?: string

  //giá
  @IsEmpty({ message: 'Giá phải là số' })
  @IsNumber({}, { message: 'Giá phải là số' })
  price_menu_amount: number
}

export class CreateRestaurantDto {
  @IsEmpty({ message: 'Danh mục nhà hàng không được để trống' })
  @IsString({ message: 'Danh mục nhà hàng phải là chuỗi' })
  restaurant_category: string

  // Tên nhà hàng
  @IsEmpty({ message: 'Tên nhà hàng không được để trống' })
  @IsString({ message: 'Tên nhà hàng phải là chu��i' })
  restaurant_name: string

  //Ảnh bìa
  @IsEmpty({ message: 'Ảnh banner không được để trống' })
  @ValidateNested()
  @Type(() => ImageUrl)
  restaurant_banner: ImageUrl

  //Địa chỉ
  @IsEmpty({ message: 'Địa chỉ nhà hàng không được để trống' })
  @IsString({ message: 'Địa chỉ nhà hàng phải là chu��i' })
  restaurant_address: string

  //Loại hình
  @IsEmpty({ message: 'Loại hình nhà hàng không được để trống' })
  @IsArray({ message: 'Loại hình nhà hàng phải là mảng' })
  restaurant_type: string[]

  //Khoảng giá
  @IsEmpty({ message: 'Khoảng giá không được để trống' })
  @ValidateNested()
  @Type(() => RestaurantPrice)
  restaurant_price: RestaurantPrice

  //Giờ hoạt động
  @IsEmpty({ message: 'Giờ hoạt động không được để trống' })
  @ValidateNested()
  @Type(() => RestaurantHours)
  restaurant_hours: RestaurantHours[]

  //Đề xuất
  @IsEmpty({ message: 'Đề xuất không được để trống' })
  @ValidateNested()
  @Type(() => RestaurantPropose)
  restaurant_propose: RestaurantPropose

  //Tóm tắt
  @IsEmpty({ message: 'Tóm tắt không được để trống' })
  @ValidateNested()
  @Type(() => RestaurantOverview)
  restaurant_overview: RestaurantOverview

  //Bảng giá
  @IsEmpty({ message: 'Bảng giá không được để trống' })
  @ValidateNested()
  @Type(() => RestaurantPriceMenu)
  restaurant_price_menu: RestaurantPriceMenu

  //Quy định
  @IsEmpty({ message: 'Quy định không được để trống' })
  @ValidateNested()
  @Type(() => MarkDown)
  restaurant_regulation: MarkDown

  //Chỗ để xe
  @IsEmpty({ message: 'Chỗ để xe không được để trống' })
  @ValidateNested()
  @Type(() => MarkDown)
  restaurant_parking_area: MarkDown

  // Tiện ích
  @IsEmpty({ message: 'Tiện ích không được để trống' })
  @IsArray({ message: 'Tiện ích phải là mảng' })
  restaurant_amenity: string[]

  //Hình ảnh nhà hàng
  @IsEmpty({ message: 'Hình ảnh nhà hàng không được để trống' })
  @ValidateNested()
  @Type(() => ImageUrl)
  restaurant_image: ImageUrl[]

  //Mô tả nhà hàng
  @IsEmpty({ message: 'Mô tả nhà hàng không được để trống' })
  @ValidateNested()
  @Type(() => MarkDown)
  restaurant_description: MarkDown
}
