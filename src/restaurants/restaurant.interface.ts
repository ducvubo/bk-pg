export interface IRestaurant {
  _id: string
  email: string
  restaurant_phone: string
  restaurant_category: string
  restaurant_name: string
  restaurant_banner: {
    image_cloud: string
    image_local: string
    image_custom: string
  }
  restaurant_address: {
    address_province: {
      value: string
      name: string
    }
    address_district: {
      value: string
      name: string
    }
    address_ward: {
      value: string
      name: string
    }
    address_specific: string
  }
  restaurant_type: string[]
  restaurant_price: {
    restaurant_price_option: string
    restaurant_price_amount: number
  }
  restaurant_hours: {
    day_of_week: string
    open: number
    close: number
  }[]
  restaurant_propose: string
  restaurant_overview: string
  restaurant_regulation: string
  restaurant_parking_area: string
  restaurant_amenity: string[]
  restaurant_image: {
    image_local: string
    image_cloud: string
    image_custom: string
  }[]
  restaurant_description: string
  restaurant_verify: boolean
  restaurant_state: boolean
  restaurant_slug: string
}

// export interface IRestaurantOrEmployee 
