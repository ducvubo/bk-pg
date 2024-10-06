import { Module } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Category, CategorySchema } from './model/category.model'
import { CategoryRepository } from './model/category.repo'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]), UsersModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository]
})
export class CategoryModule {}
