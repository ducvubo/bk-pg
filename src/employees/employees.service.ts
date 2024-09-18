import { Injectable } from '@nestjs/common'
import { EmloyeeRepository } from './model/employees.repo'

@Injectable()
export class EmployeesService {
  constructor(private readonly emloyeeRepository: EmloyeeRepository) {}
}
