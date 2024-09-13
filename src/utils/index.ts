// import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import slugify from 'slugify'
import { RestaurantHours } from 'src/restaurants/dto/create-restaurant.dto'
import { ConflictError } from './errorResponse'
import { compareSync, genSaltSync, hashSync } from 'bcryptjs'

// export const getInfoData = ({ fileds = [], object = {} }) => {
//   return _.pick(object, fileds)
// }

export const generateSlug = (input: string): string => {
  // Chuyển chuỗi thành chữ thường và loại bỏ dấu tiếng Việt
  const slug = slugify(input, {
    replacement: '-', // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: false, // convert to lower case, defaults to `false`
    strict: false, // strip special characters except replacement, defaults to `false`
    locale: 'vi', // language code of the locale to use
    trim: true // trim leading and trailing replacement chars, defaults to `true`
  })

  const uuid = uuidv4()

  return `${slug}-${uuid}.html`
}

export const getHashPassword = (password: string) => {
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

export const generateOtp = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000)
  return otp.toString()
}

export const generateStrongPassword = (length: number = 12): string => {
  // Các ký tự để tạo mật khẩu
  const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const specialCharacters = '!@#$%^&*()_+~`|}{[]:;?><,./-='

  // Gộp tất cả các ký tự lại
  const allCharacters = upperCaseLetters + lowerCaseLetters + numbers + specialCharacters

  // Hàm tạo một ký tự ngẫu nhiên từ một chuỗi
  const getRandomCharacter = (chars: string): string => {
    return chars[Math.floor(Math.random() * chars.length)]
  }

  // Bắt đầu với ít nhất một ký tự của mỗi loại
  let password = [
    getRandomCharacter(upperCaseLetters),
    getRandomCharacter(lowerCaseLetters),
    getRandomCharacter(numbers),
    getRandomCharacter(specialCharacters)
  ]

  // Thêm các ký tự ngẫu nhiên để đạt độ dài mong muốn
  for (let i = password.length; i < length; i++) {
    password.push(getRandomCharacter(allCharacters))
  }

  // Xáo trộn các ký tự để tăng tính ngẫu nhiên
  password = password.sort(() => Math.random() - 0.5)

  // Chuyển mảng thành chuỗi và trả về
  return password.join('')
}

export const generateNumberString = (length: number = 10): string => {
  const numbers = '0123456789'

  // Hàm tạo một ký tự số ngẫu nhiên
  const getRandomNumber = (): string => {
    return numbers[Math.floor(Math.random() * numbers.length)]
  }

  // Tạo chuỗi số bằng cách lặp lại để thêm các ký tự ngẫu nhiên
  let result = ''
  for (let i = 0; i < length; i++) {
    result += getRandomNumber()
  }

  return result
}

export const decodeJwt = (token: string) => {
  // Split the JWT into its components
  const parts = token.split('.')

  // Check if the token has three parts
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token')
  }

  // Decode the payload (the second part) from Base64Url
  const payload = parts[1]
  const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8')

  // Parse the decoded payload as JSON
  return JSON.parse(decodedPayload)
}
