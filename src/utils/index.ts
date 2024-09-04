// import _ from 'lodash'
// import { v4 as uuidv4 } from 'uuid'
// import slugify from 'slugify'

import { RestaurantHours } from 'src/restaurants/dto/create-restaurant.dto'
import { ConflictError } from './errorResponse'
import { compareSync, genSaltSync, hashSync } from 'bcryptjs'

// export const getInfoData = ({ fileds = [], object = {} }) => {
//   return _.pick(object, fileds)
// }

// export const generateSlug = (input: string): string => {
//   // Chuyển chuỗi thành chữ thường và loại bỏ dấu tiếng Việt
//   const slug = slugify(input, {
//     replacement: '-', // replace spaces with replacement character, defaults to `-`
//     remove: undefined, // remove characters that match regex, defaults to `undefined`
//     lower: false, // convert to lower case, defaults to `false`
//     strict: false, // strip special characters except replacement, defaults to `false`
//     locale: 'vi', // language code of the locale to use
//     trim: true // trim leading and trailing replacement chars, defaults to `true`
//   })

//   const uuid = uuidv4()

//   return `${slug}-${uuid}.html`
// }

export const getHassPassword = (password: string) => {
  const salt = genSaltSync(10)
  const hash = hashSync(password, salt)
  return hash
}
export const isValidPassword = (password: string, hash: string) => {
  return compareSync(password, hash)
}

export const checkDuplicateDays = (openingTimes: RestaurantHours[]): string | null => {
  const dayCount: Record<string, number> = {}

  for (const time of openingTimes) {
    const day = time.day_of_week
    dayCount[day] = (dayCount[day] || 0) + 1

    if (dayCount[day] > 1) {
      throw new ConflictError(`Không thể có ${dayCount[day]} ngày mở cửa giống nhau: ${day}`)
    }
  }

  return null // Không có lỗi
}
