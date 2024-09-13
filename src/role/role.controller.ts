import { Body, Controller, Get, Post } from '@nestjs/common'
import { RoleService } from './role.service'
import { ResponseMessage } from 'src/decorator/customize'

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ResponseMessage('Tạo role thành công')
  async create(@Body() body: any) {
    return this.roleService.create(body)
  }

  @Get('/user')
  @ResponseMessage('Lấy tất cả role user')
  async findAllRoleUser() {
    return await this.roleService.findAllRoleUser()
  }
}
