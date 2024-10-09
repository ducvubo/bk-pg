import { Module } from '@nestjs/common'
import { BlogService } from './blog.service'
import { BlogController } from './blog.controller'
import { BlogRepository } from './model/blog.repo'
import { MongooseModule } from '@nestjs/mongoose'
import { Blog, BlogSchema } from './model/blog.model'
import { AccountsModule } from 'src/accounts/accounts.module'
import { RestaurantsModule } from 'src/restaurants/restaurants.module'
import { EmployeesModule } from 'src/employees/employees.module'
import { UsersModule } from 'src/users/users.module'
import { TagBlogModule } from 'src/tag-blog/tag-blog.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    UsersModule,
    AccountsModule,
    RestaurantsModule,
    EmployeesModule,
    TagBlogModule
  ],
  controllers: [BlogController],
  providers: [BlogService, BlogRepository]
})
export class BlogModule {}
