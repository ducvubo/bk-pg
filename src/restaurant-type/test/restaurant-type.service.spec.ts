import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantTypeService } from './restaurant-type.service';

describe('RestaurantTypeService', () => {
  let service: RestaurantTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestaurantTypeService],
    }).compile();

    service = module.get<RestaurantTypeService>(RestaurantTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
