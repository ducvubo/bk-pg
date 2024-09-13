import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Role, RoleSchema } from './model/role.model'
import { RoleRepository } from './model/role.repo'

@Module({
  imports: [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository]
})
export class RoleModule {}
