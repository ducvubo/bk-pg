export interface IUser {
  _id: string
  us_name: string
  us_email: string
  us_address: string
  us_phone: string
}

export interface IRefreshToken {
  rf_us_id: string
  rf_refresh_token: string
  rf_public_key_refresh_token: string
  rf_public_key_access_token: string
}
