import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantTypeController } from './restaurant-type.controller';
import { RestaurantTypeService } from './restaurant-type.service';

describe('RestaurantTypeController', () => {
  let controller: RestaurantTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantTypeController],
      providers: [RestaurantTypeService],
    }).compile();

    controller = module.get<RestaurantTypeController>(RestaurantTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
