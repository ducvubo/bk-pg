import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { OrderDishRepository } from './model/order-dish.repo'
import { CreateOrderDishDto, RestaurantCreateOrderDishDto } from './dto/create-order-dish.dto'
import { IGuest } from 'src/guest-restaurant/guest.interface'
import { DishRepository } from 'src/dishes/model/dishes.repo'
import { BadRequestError } from 'src/utils/errorResponse'
import { Connection } from 'mongoose'
import { InjectConnection } from '@nestjs/mongoose'
import { OrderDishSummaryRepository } from 'src/order-dish-summary/model/order-dish-summary.repo'
import { IAccount } from 'src/accounts/accounts.interface'
import { UpdateStatusOrderDishDto } from './dto/update-status-order-dish.dto'
import { SocketGateway } from 'src/socket/socket.gateway'
import { KEY_SOCKET_GUEST_ORDER_DISH_SUMMARY_ID, KEY_SOCKET_RESTAURANT_ID } from 'src/constants/key.socket'
import { GuestRestaurantRepository } from 'src/guest-restaurant/model/guest-restaurant.repo'

@Injectable()
export class OrderDishService {
  constructor(
    private readonly orderDishRepository: OrderDishRepository,
    private readonly dishRepository: DishRepository,
    @Inject(forwardRef(() => OrderDishSummaryRepository))
    private readonly orderDishSummaryRepository: OrderDishSummaryRepository,
    private readonly guestRestaurantRepository: GuestRestaurantRepository,
    @InjectConnection() private readonly connection: Connection,
    private readonly socketGateway: SocketGateway
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
  //   const session = await this.connection.startSession() // Start session for transaction
  //   session.startTransaction()

  //   try {
  //     const orderSummary = await this.orderDishSummaryRepository.findOneById({ _id: guest.order_id })
  //     if (!orderSummary) throw new BadRequestError('Đơn hàng không tồn tại, vui lòng thử lại sau ít phút')
  //     if (orderSummary.od_dish_smr_status === 'paid')
  //       throw new BadRequestError(
  //         'Đơn hàng đã thanh toán không thể order thêm, vui lòng liên hệ nhân viên để được hỗ trợ'
  //       )
  //     if (orderSummary.od_dish_smr_status === 'refuse')
  //       throw new BadRequestError(
  //         'Đơn hàng đã bị từ chối không thể order thêm, vui lòng liên hệ nhân viên để được hỗ trợ'
  //       )

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
  //         od_dish_summary_id: orderSummary._id,
  //         od_dish_guest_id: guest._id,
  //         od_dish_duplicate_id: duplicateDish._id,
  //         od_dish_quantity: item1.od_dish_quantity,
  //         od_dish_status: 'pending'
  //       }
  //     })

  //     await this.orderDishRepository.bulkCreateOrderDish(newListOrderDish, { session }) // Use session

  //     await session.commitTransaction() // Commit the transaction
  //     this.socketGateway.handleEmitSocket({
  //       event: 'order_dish_new',
  //       data: null,
  //       to: `${KEY_SOCKET_RESTAURANT_ID}:${String(orderSummary.od_dish_smr_restaurant_id)}`
  //     })
  //     return null
  //   } catch (error) {
  //     await session.abortTransaction() // Abort the transaction in case of error
  //     console.error('Error occurred during transaction:', error.message)
  //     throw new ServerError('Có lỗi xảy ra, vui lòng thử lại sau ít phút')
  //   } finally {
  //     await session.endSession() // End the session
  //   }
  // }

  async createOrderDish(createOrderDishDto: CreateOrderDishDto[], guest: IGuest) {
    const orderSummary = await this.orderDishSummaryRepository.findOneById({ _id: guest.order_id })
    if (!orderSummary) throw new BadRequestError('Đơn hàng không tồn tại, vui lòng thử lại sau ít phút')
    if (orderSummary.od_dish_smr_status === 'paid')
      throw new BadRequestError(
        'Đơn hàng đã thanh toán không thể order thêm, vui lòng liên hệ nhân viên để được hỗ trợ'
      )
    if (orderSummary.od_dish_smr_status === 'refuse')
      throw new BadRequestError(
        'Đơn hàng đã bị từ chối không thể order thêm, vui lòng liên hệ nhân viên để được hỗ trợ'
      )

    const listDish = await Promise.all(
      createOrderDishDto.map(async (item: CreateOrderDishDto) => {
        const dish = await this.dishRepository.findOne({ _id: item.od_dish_id })
        if (!dish) {
          throw new BadRequestError('Món ăn không tồn tại, vui lòng thử lại sau ít phút')
        }
        return dish
      })
    )

    const listDishDuplicate = this.transformToDishDuplicate(listDish)

    const newListDishDuplicate = await this.orderDishRepository.bulkCreateDishDuplicate(listDishDuplicate)

    const newListOrderDish = createOrderDishDto.map((item1) => {
      const duplicateDish = newListDishDuplicate.find(
        (item2) => item2.dish_duplicate_dish_id.toString() === item1.od_dish_id
      )
      if (!duplicateDish) {
        throw new BadRequestError('Món ăn không tồn tại, vui lòng thử lại sau ít phút')
      }
      return {
        od_dish_summary_id: orderSummary._id,
        od_dish_guest_id: guest._id,
        od_dish_duplicate_id: duplicateDish._id,
        od_dish_quantity: item1.od_dish_quantity,
        od_dish_status: 'pending'
      }
    })

    await this.orderDishRepository.bulkCreateOrderDish(newListOrderDish)

    this.socketGateway.handleEmitSocket({
      event: 'order_dish_new',
      data: null,
      to: `${KEY_SOCKET_RESTAURANT_ID}:${String(orderSummary.od_dish_smr_restaurant_id)}`
    })
    return null
  }

  async listOrderGuest(guest: IGuest) {
    const orderSummary = await this.orderDishSummaryRepository.findOneById({ _id: guest.order_id })
    const order = await this.orderDishRepository.listOrderGuest({ od_dish_summary_id: guest.order_id })
    const newOrder = {
      _id: orderSummary._id,
      od_dish_smr_restaurant_id: orderSummary.od_dish_smr_restaurant_id,
      od_dish_smr_guest_id: orderSummary.od_dish_smr_guest_id,
      od_dish_smr_table_id: orderSummary.od_dish_smr_table_id,
      od_dish_smr_status: orderSummary.od_dish_smr_status,
      or_dish: order
    }
    return newOrder
  }

  async updateStatusOrderDish(updateStatusOrderDishDto: UpdateStatusOrderDishDto, account: IAccount) {
    const { _id, od_dish_summary_id } = updateStatusOrderDishDto
    const orderSummary = await this.orderDishSummaryRepository.findOneById({ _id: od_dish_summary_id })
    if (!orderSummary) throw new BadRequestError('Đơn hàng không tồn tại, vui lòng thử lại sau ít phút')
    if (orderSummary.od_dish_smr_status === 'paid')
      throw new BadRequestError('Đơn hàng đã thanh toán không thể cập nhật trạng thái')
    if (orderSummary.od_dish_smr_status === 'refuse')
      throw new BadRequestError('Đơn hàng đã bị từ chối không thể cập nhật trạng thái')
    const order = await this.orderDishRepository.findOneById({ _id })
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại, vui lòng thử lại sau ít phút')
    const update = await this.orderDishRepository.updateStatusOrderDish(updateStatusOrderDishDto, account)
    if (!update) throw new BadRequestError('Cập nhật trạng thái đơn hàng thất bại, vui lòng thử lại sau ít phút')
    const dish = await this.orderDishRepository.findOneDishDuplicateById({ _id: String(order.od_dish_duplicate_id) })
    this.socketGateway.handleEmitSocket({
      event: 'update-status-order-dish',
      data: {
        dish_duplicate_name: dish.dish_duplicate_name,
        od_dish_status: updateStatusOrderDishDto.od_dish_status
      },
      to: `${KEY_SOCKET_GUEST_ORDER_DISH_SUMMARY_ID}:${String(orderSummary._id)}`
    })

    return update
  }

  async restaurantCreateOrderDish(restaurantCreateOrderDishDto: RestaurantCreateOrderDishDto, account: IAccount) {
    const orderSummary: any = await this.orderDishSummaryRepository.findOneById({
      _id: restaurantCreateOrderDishDto.od_dish_summary_id
    })
    if (!orderSummary) throw new BadRequestError('Đơn hàng không tồn tại, vui lòng thử lại sau ít phút')
    if (orderSummary.od_dish_smr_status === 'paid')
      throw new BadRequestError(
        'Đơn hàng đã thanh toán không thể order thêm, vui lòng liên hệ nhân viên để được hỗ trợ'
      )
    if (orderSummary.od_dish_smr_status === 'refuse')
      throw new BadRequestError(
        'Đơn hàng đã bị từ chối không thể order thêm, vui lòng liên hệ nhân viên để được hỗ trợ'
      )

    const listDish = await Promise.all(
      restaurantCreateOrderDishDto.order_dish.map(async (item: CreateOrderDishDto) => {
        const dish = await this.dishRepository.findOne({ _id: item.od_dish_id })
        if (!dish) {
          throw new BadRequestError('Món ăn không tồn tại, vui lòng thử lại sau ít phút')
        }
        return dish
      })
    )

    const listDishDuplicate = this.transformToDishDuplicate(listDish)

    const newListDishDuplicate = await this.orderDishRepository.bulkCreateDishDuplicate(listDishDuplicate)

    const newGuest = await this.guestRestaurantRepository.createGuestRestaurant({
      guest_restaurant_id: String(orderSummary.od_dish_smr_restaurant_id),
      guest_table_id: String(orderSummary.od_dish_smr_table_id),
      owner_id: String(orderSummary.od_dish_smr_guest_id._id),
      owner_name: orderSummary.od_dish_smr_guest_id.guest_name,
      createdBy: {
        _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
        email: account.account_email
      }
    })

    const newListOrderDish = restaurantCreateOrderDishDto.order_dish.map((item1) => {
      const duplicateDish = newListDishDuplicate.find(
        (item2) => item2.dish_duplicate_dish_id.toString() === item1.od_dish_id
      )
      if (!duplicateDish) {
        throw new BadRequestError('Món ăn không tồn tại, vui lòng thử lại sau ít phút')
      }
      return {
        od_dish_summary_id: orderSummary._id,
        od_dish_guest_id: newGuest._id,
        od_dish_duplicate_id: duplicateDish._id,
        od_dish_quantity: item1.od_dish_quantity,
        od_dish_status: 'pending',
        createdBy: {
          _id: account.account_type === 'employee' ? account.account_employee_id : account.account_restaurant_id,
          email: account.account_email
        }
      }
    })

    await this.orderDishRepository.bulkCreateOrderDish(newListOrderDish)

    this.socketGateway.handleEmitSocket({
      event: 'order_dish_new_restaurant',
      data: null,
      to: `${KEY_SOCKET_GUEST_ORDER_DISH_SUMMARY_ID}:${String(orderSummary._id)}`
    })
    return null
  }
}
