import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RestaurantsModule } from './restaurants/restaurants.module'
import { MongooseModule } from '@nestjs/mongoose'
import { AmenitiesModule } from './amenities/amenities.module'
import { CategoryModule } from './category/category.module'
import { RestaurantTypeModule } from './restaurant-type/restaurant-type.module'
import { UploadModule } from './upload/upload.module'
import { UsersModule } from './users/users.module'
import { MailModule } from './mail/mail.module'
import { RoleModule } from './role/role.module'
import { BookTableModule } from './book-table/book-table.module'
import { ScheduleModule } from '@nestjs/schedule'
import { CronModule } from './cron/cron.module'
import { EmployeesModule } from './employees/employees.module'
import { AccountsModule } from './accounts/accounts.module'
import { TablesModule } from './tables/tables.module'
import { DishesModule } from './dishes/dishes.module'
import { GuestRestaurantModule } from './guest-restaurant/guest-restaurant.module'
import { OrderDishModule } from './order-dish/order-dish.module'
import { OrderDishSummaryModule } from './order-dish-summary/order-dish-summary.module'
import { SocketModule } from './socket/socket.module'
import { BlogModule } from './blog/blog.module'
import { TagBlogModule } from './tag-blog/tag-blog.module'
import { CheckSignMiddleware } from './middleware/checkSign.middleware'
import { CommentBlogModule } from './comment-blog/comment-blog.module'
import { CategoryRestaurantModule } from './category-restaurant/category-restaurant.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL')
      })
    }),
    RestaurantsModule,
    AmenitiesModule,
    CategoryModule,
    RestaurantTypeModule,
    UploadModule,
    UsersModule,
    MailModule,
    RoleModule,
    BookTableModule,
    CronModule,
    EmployeesModule,
    AccountsModule,
    TablesModule,
    DishesModule,
    GuestRestaurantModule,
    OrderDishModule,
    OrderDishSummaryModule,
    SocketModule,
    BlogModule,
    TagBlogModule,
    CommentBlogModule,
    CategoryRestaurantModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(CheckSignMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
//   }
// }
