import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Role, RoleDocument } from './role.model'

@Injectable()
export class RoleRepository {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async create(body: { rl_name: string; rl_description: string }): Promise<RoleDocument> {
    const { rl_name, rl_description } = body
    return this.roleModel.create({
      rl_name,
      rl_description
    })
  }

  async findAllRoleUser(): Promise<RoleDocument[]> {
    return this.roleModel.find({ rl_type: 'user' }).select('_id rl_name')
  }
}
