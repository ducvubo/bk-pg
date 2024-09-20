import { Injectable } from '@nestjs/common'
import { EmloyeeRepository } from './model/employees.repo'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { AccountsService } from 'src/accounts/accounts.service'
import { BadRequestError, ConflictError } from 'src/utils/errorResponse'
import aqp from 'api-query-params'

@Injectable()
export class EmployeesService {
  constructor(
    private readonly emloyeeRepository: EmloyeeRepository,
    private readonly accountsService: AccountsService
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto, account: IAccount) {
    const employeeExist = await this.emloyeeRepository.findOneByCreate({
      epl_email: createEmployeeDto.epl_email,
      epl_restaurant_id: account.account_restaurant_id
    })

    if (employeeExist) {
      throw new ConflictError('Nhân viên đã tồn tại, vui lòng kiểm tra lại')
    }

    const newEmployee = await this.emloyeeRepository.create(createEmployeeDto, account)
    await this.accountsService.createAccount({
      account_email: newEmployee.epl_email,
      account_password: createEmployeeDto.epl_password,
      account_type: 'employee',
      account_restaurant_id: account.account_restaurant_id,
      account_employee_id: String(newEmployee._id)
    })

    return newEmployee
  }

  async findAllPagination(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ) {
    currentPage = isNaN(currentPage) ? 1 : currentPage
    limit = isNaN(limit) ? 10 : limit

    if (currentPage <= 0 || limit <= 0) {
      throw new BadRequestError('Trang hiện tại và số record phải lớn hơn 0')
    }

    const { filter, sort, population } = aqp(qs)

    delete filter.current
    delete filter.pageSize

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit ? +limit : 10

    const totalItems = await this.emloyeeRepository.totalItems(account)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    // const population = 'restaurant_category'

    const result = await this.emloyeeRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
      account
    )

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        totalPage: totalPages,
        totalItem: totalItems
      },
      result
    }
  }
}
