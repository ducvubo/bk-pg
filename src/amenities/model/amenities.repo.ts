import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { Amenity, AmenityDocument } from './amenities.model'

@Injectable()
export class AmenityRepository {
  constructor(@InjectModel(Amenity.name) private amenityModel: Model<AmenityDocument>) {}

  async create({ amenity_name }: { amenity_name: string }): Promise<AmenityDocument> {
    return await this.amenityModel.create({ amenity_name })
  }

  async findAll(): Promise<AmenityDocument[]> {
    return await this.amenityModel.find().select('amenity_name _id').exec()
  }

  async getAmenitylByName({ amenity_name }: { amenity_name: string }): Promise<AmenityDocument> {
    return this.amenityModel.findOne({ amenity_name }).exec()
  }

  async getAmenityByNameInfor({ amenity_name }: { amenity_name: string }): Promise<AmenityDocument[]> {
    return this.amenityModel.find({
      amenity_name: { $regex: amenity_name, $options: 'i' }
    })
  }
}
