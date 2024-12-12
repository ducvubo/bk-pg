import { Module } from '@nestjs/common';
import { CategoryRestaurantService } from './category-restaurant.service';
import { CategoryRestaurantController } from './category-restaurant.controller';

@Module({
  controllers: [CategoryRestaurantController],
  providers: [CategoryRestaurantService],
})
export class CategoryRestaurantModule {}
