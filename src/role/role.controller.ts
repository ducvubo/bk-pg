import { Body, Controller, Get, Post } from '@nestjs/common'
import { RoleService } from './role.service'
import { ResponseMessage } from 'src/decorator/customize'
import { RoleDocument } from './model/role.model'

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ResponseMessage('Tạo role thành công')
  async create(@Body() body: { rl_name: string; rl_description: string }): Promise<RoleDocument> {
    return this.roleService.create(body)
  }

  @Get('/user')
  @ResponseMessage('Lấy tất cả role user')
  async findAllRoleUser(): Promise<RoleDocument[]> {
    return await this.roleService.findAllRoleUser()
  }
}
