import { forwardRef, Module } from '@nestjs/common'
import { EmployeesService } from './employees.service'
import { EmployeesController } from './employees.controller'
import { RestaurantsModule } from 'src/restaurants/restaurants.module'
import { EmloyeeRepository } from './model/employees.repo'
import { MongooseModule } from '@nestjs/mongoose'
import { Employee, EmployeeSchema } from './model/employees.model'
import { AccountsModule } from 'src/accounts/accounts.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Employee.name, schema: EmployeeSchema }]),
    AccountsModule,
    forwardRef(() => RestaurantsModule)
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, EmloyeeRepository],
  exports: [EmployeesService]
})
export class EmployeesModule {}
