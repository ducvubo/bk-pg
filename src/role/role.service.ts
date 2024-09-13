import { Injectable } from '@nestjs/common'
import { RoleRepository } from './model/role.repo'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(body: any) {
    return await this.roleRepository.create(body)
  }

  async findAllRoleUser() {
    return await this.roleRepository.findAllRoleUser()
  }
}
