import { Injectable } from '@nestjs/common'
import { OrderDishRepository } from './model/order-dish.repo'
import { CreateOrderDishDto } from './dto/create-order-dish.dto'
import { IGuest } from 'src/guest-restaurant/guest.interface'
import { DishRepository } from 'src/dishes/model/dishes.repo'
import { BadRequestError, ServerError } from 'src/utils/errorResponse'
import { Connection } from 'mongoose'
import { InjectConnection } from '@nestjs/mongoose'

@Injectable()
export class OrderDishService {
  constructor(
    private readonly orderDishRepository: OrderDishRepository,
    private readonly dishRepository: DishRepository,
    @InjectConnection() private readonly connection: Connection
  ) {}

  transformToDishDuplicate(data: any[]) {
    return data.map((item) => ({
      dish_duplicate_dish_id: item._id,
      dish_duplicate_restaurant_id: item.dish_restaurant_id,
      dish_duplicate_name: item.dish_name,
      dish_duplicate_image: {
        image_cloud: item.dish_image?.image_cloud,
        image_custom: item.dish_image?.image_custom
      },
      dish_duplicate_price: item.dish_price,
      dish_duplicate_short_description: item.dish_short_description,
      dish_duplicate_sale: item.dish_sale
        ? {
            sale_type: item.dish_sale.sale_type,
            sale_value: item.dish_sale.sale_value
          }
        : null,
      dish_duplicate_priority: item.dish_priority ?? 0,
      dish_duplicate_description: item.dish_description,
      dish_duplicate_note: item.dish_note || '',
      dish_duplicate_status: item.dish_status === 'enable' ? 'enable' : 'disable'
    }))
  }

  async createOrderDish(createOrderDishDto: CreateOrderDishDto[], guest: IGuest) {
    const session = await this.connection.startSession() // Start session for transaction
    session.startTransaction() // Start transaction

    try {
      const listDish = await Promise.all(
        createOrderDishDto.map(async (item: CreateOrderDishDto) => {
          const dish = await this.dishRepository.findOne({ _id: item.od_dish_id }, session) // Use session
          if (!dish) {
            throw new BadRequestError('Món ăn không tồn tại, vui lòng thử lại sau ít phút')
          }
          return dish
        })
      )

      const listDishDuplicate = this.transformToDishDuplicate(listDish)
      const newListDishDuplicate = await this.orderDishRepository.bulkCreateDishDuplicate(listDishDuplicate, {
        session
      }) // Use session

      const newListOrderDish = createOrderDishDto.map((item1) => {
        const duplicateDish = newListDishDuplicate.find(
          (item2) => item2.dish_duplicate_dish_id.toString() === item1.od_dish_id
        )
        if (!duplicateDish) {
          throw new BadRequestError('Món ăn không tồn tại, vui lòng thử lại sau ít phút')
        }
        return {
          od_dish_restaurant_id: guest.guest_restaurant_id,
          od_dish_guest_id: guest._id,
          od_dish_table_id: guest.guest_table_id,
          od_dish_duplicate_id: duplicateDish._id,
          od_dish_quantity: item1.od_dish_quantity,
          od_dish_status: 'pending'
        }
      })

      await this.orderDishRepository.bulkCreateOrderDish(newListOrderDish, { session }) // Use session

      await session.commitTransaction() // Commit the transaction
      return null
    } catch (error) {
      await session.abortTransaction() // Abort the transaction in case of error
      console.error('Error occurred during transaction:', error) // Log error for debugging
      throw new ServerError('Có lỗi xảy ra, vui lòng thử lại sau ít phút') // Throw error to the client
    } finally {
      session.endSession() // End the session
    }
  }

  async listOrderGuest(guest: IGuest) {
    return this.orderDishRepository.listOrderGuest(guest)
  }
}
