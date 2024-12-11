import { Injectable } from '@nestjs/common'
import { RoleRepository } from './model/role.repo'
import { RoleDocument } from './model/role.model'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(body: { rl_name: string; rl_description: string }): Promise<RoleDocument> {
    return await this.roleRepository.create(body)
  }

  async findAllRoleUser(): Promise<RoleDocument[]> {
    return await this.roleRepository.findAllRoleUser()
  }
}
