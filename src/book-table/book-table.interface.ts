export interface IHour {
  day_of_week: string
  open: HuorLBVl
  close: HuorLBVl
}
export interface HuorLBVl {
  label: string
  value: number
}

export const dayOfWeekMap: { [key: string]: number } = {
  'Chủ Nhật': 0,
  'Thứ Hai': 1,
  'Thứ Ba': 2,
  'Thứ Tư': 3,
  'Thứ Năm': 4,
  'Thứ Sáu': 5,
  'Thứ Bảy': 6
}

export const daysOfWeekMapping = {
  Sunday: 'Chủ Nhật',
  Monday: 'Thứ Hai',
  Tuesday: 'Thứ Ba',
  Wednesday: 'Thứ Tư',
  Thursday: 'Thứ Năm',
  Friday: 'Thứ Sáu',
  Saturday: 'Thứ Bảy'
}
