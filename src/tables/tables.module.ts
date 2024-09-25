import { Module } from '@nestjs/common'
import { TablesService } from './tables.service'
import { TablesController } from './tables.controller'
import { TableRepository } from './model/tables.repo'
import { MongooseModule } from '@nestjs/mongoose'
import { Table, TableSchema } from './model/tables.model'
import { AccountsModule } from 'src/accounts/accounts.module'
import { RestaurantsModule } from 'src/restaurants/restaurants.module'
import { EmployeesModule } from 'src/employees/employees.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Table.name, schema: TableSchema }]),
    AccountsModule,
    RestaurantsModule,
    EmployeesModule
  ],
  controllers: [TablesController],
  providers: [TablesService, TableRepository],
  exports: [TablesService, TableRepository]
})
export class TablesModule {}
