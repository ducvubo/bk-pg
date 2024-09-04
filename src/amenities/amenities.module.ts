import { Module } from '@nestjs/common'
import { AmenitiesService } from './amenities.service'
import { AmenitiesController } from './amenities.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Amenity, AmenitySchema } from './model/amenities.model'
import { AmenityRepository } from './model/amenities.repo'

@Module({
  imports: [MongooseModule.forFeature([{ name: Amenity.name, schema: AmenitySchema }])],
  controllers: [AmenitiesController],
  providers: [AmenitiesService, AmenityRepository]
})
export class AmenitiesModule {}
