export interface IGuest {
  _id: string
  guest_restaurant_id: string
  guest_table_id: string
  guest_name: string
  guest_type: 'member' | 'owner'
  order_id: string
  guest_owner_id: string
}
