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
import { decodeJwt, isValidPassword } from 'src/utils'
import { getCacheIO, setCacheIOExpiration } from 'src/utils/cache'
import { KEY_BLACK_LIST_TOKEN_EMPLOYEE } from 'src/constants/key.redis'
import { EmployeeDocument } from './model/employees.model'

@Injectable()
export class EmployeesService {
  constructor(
    private readonly emloyeeRepository: EmloyeeRepository,
    private readonly accountsService: AccountsService,
    private readonly configService: ConfigService
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto, account: IAccount): Promise<EmployeeDocument> {
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
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: EmployeeDocument[]
  }> {
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

  async findOneById({ _id, account }: { _id: string; account: IAccount }): Promise<EmployeeDocument> {
    if (!_id) throw new BadRequestError('Nhân viên này không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhân viên không tồn tại')
    const employee = await this.emloyeeRepository.findOneById({ _id, account })
    if (!employee) throw new NotFoundError('Nhân viên không tồn tại')
    return employee
  }

  async update(updateEmployeeDto: UpdateEmployeeDto, account: IAccount): Promise<EmployeeDocument> {
    const { _id } = updateEmployeeDto
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhân viên không tồn tại')
    const employee = await this.emloyeeRepository.findOneById({ _id, account })
    if (!employee) throw new NotFoundError('Nhân viên không tồn tại')
    return await this.emloyeeRepository.update(updateEmployeeDto, account)
  }

  async delete({ _id, account }: { _id: string; account: IAccount }): Promise<EmployeeDocument> {
    if (!_id) throw new BadRequestError('Nhân viên này không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhân viên không tồn tại')
    const employee = await this.emloyeeRepository.findOneById({ _id, account })
    if (!employee) throw new NotFoundError('Nhân viên không tồn tại')
    return await this.emloyeeRepository.delete({ _id, account })
  }

  async findAllRecycle(
    { currentPage = 1, limit = 10, qs }: { currentPage: number; limit: number; qs: string },
    account: IAccount
  ): Promise<{
    meta: { current: number; pageSize: number; totalPage: number; totalItem: number }
    result: EmployeeDocument[]
  }> {
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

  async restore({ _id, account }: { _id: string; account: IAccount }): Promise<EmployeeDocument> {
    if (!_id) throw new BadRequestError('Nhân viên này không tồn tại')
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhân viên không tồn tại1')
    const employee = await this.emloyeeRepository.findOneById({ _id, account })
    if (!employee) throw new NotFoundError('Nhân viên không tồn tại2')
    return await this.emloyeeRepository.restore({ _id, account })
  }

  async updateStatus(updateStatusEmployeeDto: UpdateStatusEmployeeDto, account: IAccount): Promise<EmployeeDocument> {
    const { _id } = updateStatusEmployeeDto
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new NotFoundError('Nhân viên không tồn tại')
    const employee = await this.emloyeeRepository.findOneById({ _id, account })
    if (!employee) throw new NotFoundError('Nhân viên không tồn tại')
    return await this.emloyeeRepository.updateStatus(updateStatusEmployeeDto, account)
  }

  async login(loginEmployeeDto: LoginEmployeeDto): Promise<{ access_token_epl: string; refresh_token_epl: string }> {
    const { epl_email, epl_password, epl_restaurant_id } = loginEmployeeDto

    const employee = await this.emloyeeRepository.findOneByEmailWithLogin({ epl_email, epl_restaurant_id })
    if (!employee) throw new UnauthorizedCodeError('Email hoặc mật khẩu không đúng', -1)

    const account = await this.accountsService.findAccountByIdEmployee({
      account_employee_id: String(employee._id),
      account_restaurant_id: epl_restaurant_id
    })

    if (!isValidPassword(epl_password, account.account_password))
      throw new UnauthorizedCodeError('Email hoặc mật khẩu không đúng', -1)

    const token: { access_token: string; refresh_token: string } = await this.accountsService.generateRefreshTokenCP({
      _id: String(account._id)
    })
    return {
      access_token_epl: token.access_token,
      refresh_token_epl: token.refresh_token
    }
  }

  async findOneByIdOfToken({ _id }): Promise<EmployeeDocument> {
    return await this.emloyeeRepository.findOneByIdOfToken({ _id })
  }

  async getInforEmployee(account: IAccount): Promise<EmployeeDocument> {
    return await this.emloyeeRepository.getInfor({
      _id: account.account_employee_id,
      epl_restaurant_id: account.account_restaurant_id
    })
  }

  async findRefreshToken({ rf_refresh_token }: { rf_refresh_token: string }) {
    return await this.accountsService.findRefreshToken({ rf_refresh_token })
  }

  async refreshToken({
    refresh_token
  }: {
    refresh_token: string
  }): Promise<{ access_token_epl: string; refresh_token_epl: string }> {
    if (refresh_token) {
      const isBlackList = await getCacheIO(`${KEY_BLACK_LIST_TOKEN_EMPLOYEE}:${refresh_token}`)
      if (isBlackList) {
        const decodedJWT = decodeJwt(refresh_token)
        await this.accountsService.logoutAll({ rf_cp_epl_id: decodedJWT._id })
        throw new UnauthorizedCodeError('Token đã lỗi vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ 1', -10)
      } else {
        try {
          const key = await this.findRefreshToken({
            rf_refresh_token: refresh_token
          })

          if (!key) throw new UnauthorizedCodeError('Token không hợp lệ 1', -10)
          if (key) {
            const data_refresh_token = this.accountsService.verifyToken(refresh_token, key.rf_public_key_refresh_token)
            const result = await Promise.all([
              await this.accountsService.generateRefreshTokenCP({
                _id: String(data_refresh_token._id)
              }),
              await setCacheIOExpiration(
                `${KEY_BLACK_LIST_TOKEN_EMPLOYEE}:${refresh_token}`,
                'hehehehehehehe',
                this.configService.get<string>('JWT_REFRESH_EXPIRE_REDIS')
              ),
              await this.accountsService.deleteToken({
                rf_refresh_token: refresh_token,
                rf_cp_epl_id: data_refresh_token._id
              })
            ])

            return {
              access_token_epl: result[0].access_token,
              refresh_token_epl: result[0].refresh_token
            }
          }
        } catch (error) {
          console.log(error)
          throw new UnauthorizedCodeError('Token lỗi vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ 2', -10)
        }
      }
    } else {
      throw new UnauthorizedCodeError('Không tìm thấy token ở header', -10)
    }
  }
}
