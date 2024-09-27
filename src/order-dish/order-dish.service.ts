import { Injectable } from '@nestjs/common'
import { OrderDishRepository } from './model/order-dish.repo'
import { CreateOrderDishDto } from './dto/create-order-dish.dto'
import { IGuest } from 'src/guest-restaurant/guest.interface'
import { DishRepository } from 'src/dishes/model/dishes.repo'
import { BadRequestError, NotFoundError, ServerError } from 'src/utils/errorResponse'
import mongoose, { Connection } from 'mongoose'
import { InjectConnection } from '@nestjs/mongoose'
import aqp from 'api-query-params'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateStatusOrderDishDto } from './dto/update-status-order-dish.dto'

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

  // async createOrderDish(createOrderDishDto: CreateOrderDishDto[], guest: IGuest) {
  //   console.log(createOrderDishDto)
  //   const session = await this.connection.startSession() // Start session for transaction
  //   console.log('Starting transaction')
  //   session.startTransaction()
  //   console.log('Transaction started')

  //   try {
  //     const listDish = await Promise.all(
  //       createOrderDishDto.map(async (item: CreateOrderDishDto) => {
  //         const dish = await this.dishRepository.findOne({ _id: item.od_dish_id }, session) // Use session
  //         if (!dish) {
  //           throw new BadRequestError('Món ăn không tồn tại, vui lòng thử lại sau ít phút')
  //         }
  //         return dish
  //       })
  //     )

  //     const listDishDuplicate = this.transformToDishDuplicate(listDish)
  //     const newListDishDuplicate = await this.orderDishRepository.bulkCreateDishDuplicate(listDishDuplicate, {
  //       session
  //     }) // Use session

  //     const newListOrderDish = createOrderDishDto.map((item1) => {
  //       const duplicateDish = newListDishDuplicate.find(
  //         (item2) => item2.dish_duplicate_dish_id.toString() === item1.od_dish_id
  //       )
  //       if (!duplicateDish) {
  //         throw new BadRequestError('Món ăn không tồn tại, vui lòng thử lại sau ít phút')
  //       }
  //       return {
  //         od_dish_restaurant_id: guest.guest_restaurant_id,
  //         od_dish_guest_id: guest._id,
  //         od_dish_table_id: guest.guest_table_id,
  //         od_dish_duplicate_id: duplicateDish._id,
  //         od_dish_quantity: item1.od_dish_quantity,
  //         od_dish_status: 'pending',
  //         createdAt: new Date('Fri Sep 20 2024 00:00:00 GMT+0700 (Indochina Time)')
  //       }
  //     })

  //     await this.orderDishRepository.bulkCreateOrderDish(newListOrderDish, { session }) // Use session

  //     await session.commitTransaction() // Commit the transaction
  //     return null
  //   } catch (error) {
  //     await session.abortTransaction() // Abort the transaction in case of error
  //     console.error('Error occurred during transaction:', error.message) // Log error for debugging
  //     throw new ServerError('Có lỗi xảy ra, vui lòng thử lại sau ít phút') // Throw error to the client
  //   } finally {
  //     session.endSession() // End the session
  //   }
  // }

  async createOrderDish(createOrderDishDto: CreateOrderDishDto[], guest: IGuest) {
    const session = await this.connection.startSession() // Start session for transaction
    session.startTransaction()
    console.log('Transaction started')

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
      console.log('Transaction committed')
      return null
    } catch (error) {
      await session.abortTransaction() // Abort the transaction in case of error
      console.error('Error occurred during transaction:', error.message)
      throw new ServerError('Có lỗi xảy ra, vui lòng thử lại sau ít phút')
    } finally {
      await session.endSession() // End the session
      console.log('Session ended')
    }
  }

  async listOrderGuest(guest: IGuest) {
    return this.orderDishRepository.listOrderGuest(guest)
  }

  async listOrderRestaurant(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ) {
    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 8 : limit

    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }

    const { filter, sort } = aqp(qs)


    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10

    filter.guest_name = filter.guest_name ? filter.guest_name : undefined
    filter.tbl_name = filter.tbl_name ? filter.tbl_name : undefined

    //'processing' | 'pending' | 'paid' | 'delivered' | 'refuse'
    const validStatuses = ['processing', 'pending', 'paid', 'delivered', 'refuse']

    if (!validStatuses.includes(filter.od_dish_status)) {
      delete filter.od_dish_status
    }

    const item = await this.orderDishRepository.totalItemsListOrderRestaurant(filter, account)
    const totalPages = Math.ceil(item.totalItems / defaultLimit)

    const result = await this.orderDishRepository.findPaginationListOrderRestaurant(
      {
        offset,
        defaultLimit,
        sort,
        filter
      },
      account
    )

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        totalPage: totalPages,
        totalItem: item.totalItems,
        statusCount: item.statusCounts
      },
      result
    }
  }

  async updateStatusOrderDish(updateStatusOrderDishDto: UpdateStatusOrderDishDto, account: IAccount) {
    const { _id } = updateStatusOrderDishDto
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Đơn hàng không tồn tại')
    const order = await this.orderDishRepository.findOneById({ _id, account })
    if (!order) throw new NotFoundError('Đơn hàng không tồn tại')
    return this.orderDishRepository.updateStatusOrderDish(updateStatusOrderDishDto, account)
  }
}
