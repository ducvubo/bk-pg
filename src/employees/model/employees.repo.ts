import { InjectModel } from '@nestjs/mongoose'
import { Employee, EmployeeDocument } from './employees.model'
import { Model } from 'mongoose'

export class EmloyeeRepository {
  constructor(@InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>) {}
}
