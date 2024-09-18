import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { EmployeesService } from './employees.service'
import { ResponseMessage, RestaurantOrEmployee } from 'src/decorator/customize'
import { RestaurantOrEmployeeAuthGuard } from 'src/guard/restaurant.guard'
import { CreateEmployeeDto } from './dto/create-employee.dto'

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // @Post()
  // @ResponseMessage('Tạo nhân viên thành công')
  // @UseGuards(RestaurantOrEmployeeAuthGuard)
  // async create(@Body() createEmployeeDto: CreateEmployeeDto,@RestaurantOrEmployee() infor: I) {
  //   return await this.employeesService.create(createEmployeeDto)
  // }
}
