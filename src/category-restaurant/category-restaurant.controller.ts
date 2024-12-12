import { Controller } from '@nestjs/common';
import { CategoryRestaurantService } from './category-restaurant.service';

@Controller('category-restaurant')
export class CategoryRestaurantController {
  constructor(private readonly categoryRestaurantService: CategoryRestaurantService) {}
}
