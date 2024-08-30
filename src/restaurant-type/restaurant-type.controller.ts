import { Controller } from '@nestjs/common';
import { RestaurantTypeService } from './restaurant-type.service';

@Controller('restaurant-type')
export class RestaurantTypeController {
  constructor(private readonly restaurantTypeService: RestaurantTypeService) {}
}
