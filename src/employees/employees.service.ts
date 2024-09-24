import { Injectable } from '@nestjs/common'
import { EmloyeeRepository } from './model/employees.repo'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { IAccount } from 'src/accounts/accounts.interface'
import { AccountsService } from 'src/accounts/accounts.service'
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedCodeError } from 'src/utils/errorResponse'
import aqp from 'api-query-params'
import mongoose from 'mongoose'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { UpdateStatusEmployeeDto } from './dto/update-status-employee.dto'
import { LoginEmployeeDto } from './dto/login-employee.dto'
import { ConfigService } from '@nestjs/config'
import { isValidPassword } from 'src/utils'

@Injectable()
export class EmployeesService {
  constructor(
    private readonly emloyeeRepository: EmloyeeRepository,
    private readonly accountsService: AccountsService,
    private readonly configService: ConfigService
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

    const totalItems = await this.emloyeeRepository.totalItems(account, false)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    // const population = 'restaurant_category'

    const result = await this.emloyeeRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
      account,
      false
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

  async findOneById({ _id, account }: { _id: string; account: IAccount }) {
    if (!_id) throw new BadRequestError('Nhân viên này không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhân viên không tồn tại')
    const employee = await this.emloyeeRepository.findOneById({ _id, account })
    if (!employee) throw new NotFoundError('Nhân viên không tồn tại')
    return employee
  }

  async update(updateEmployeeDto: UpdateEmployeeDto, account: IAccount) {
    const { _id } = updateEmployeeDto
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhân viên không tồn tại')
    const employee = await this.emloyeeRepository.findOneById({ _id, account })
    if (!employee) throw new NotFoundError('Nhân viên không tồn tại')
    return await this.emloyeeRepository.update(updateEmployeeDto, account)
  }

  async delete({ _id, account }: { _id: string; account: IAccount }) {
    if (!_id) throw new BadRequestError('Nhân viên này không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhân viên không tồn tại')
    const employee = await this.emloyeeRepository.findOneById({ _id, account })
    if (!employee) throw new NotFoundError('Nhân viên không tồn tại')
    return await this.emloyeeRepository.delete({ _id, account })
  }

  async findAllRecycle(
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

    const totalItems = await this.emloyeeRepository.totalItems(account, true)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.emloyeeRepository.findAllPagination(
      {
        offset,
        defaultLimit,
        sort,
        population
      },
      account,
      true
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

  async restore({ _id, account }: { _id: string; account: IAccount }) {
    if (!_id) throw new BadRequestError('Nhân viên này không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhân viên không tồn tại')
    const employee = await this.emloyeeRepository.findOneById({ _id, account })
    if (!employee) throw new NotFoundError('Nhân viên không tồn tại')
    return await this.emloyeeRepository.restore({ _id, account })
  }

  async updateStatus(updateStatusEmployeeDto: UpdateStatusEmployeeDto, account: IAccount) {
    const { _id } = updateStatusEmployeeDto
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhân viên không tồn tại')
    const employee = await this.emloyeeRepository.findOneById({ _id, account })
    if (!employee) throw new NotFoundError('Nhân viên không tồn tại')
    return await this.emloyeeRepository.updateStatus(updateStatusEmployeeDto, account)
  }

  async login(loginEmployeeDto: LoginEmployeeDto) {
    const { epl_email, epl_password, epl_restaurant_id } = loginEmployeeDto

    const employee = await this.emloyeeRepository.findOneByEmailWithLogin({ epl_email, epl_restaurant_id })
    if (!employee) throw new UnauthorizedCodeError('Email hoặc mật khẩu không đúng', -1)

    const account = await this.accountsService.findAccountByIdEmployee({
      account_employee_id: String(employee._id),
      account_restaurant_id: epl_restaurant_id
    })

    if (!isValidPassword(epl_password, account.account_password))
      throw new UnauthorizedCodeError('Email hoặc mật khẩu không đúng', -1)

    const token: { access_token_rtr: string; refresh_token_rtr: string } =
      await this.accountsService.generateRefreshTokenCP({ _id: String(account._id) })
    return token
  }

  async findOneByIdOfToken({ _id }) {
    return await this.emloyeeRepository.findOneByIdOfToken({ _id })
  }

  async getInforEmployee(account: IAccount) {
    return await this.emloyeeRepository.getInfor({
      _id: account.account_employee_id,
      epl_restaurant_id: account.restaurant_id
    })
  }
}
