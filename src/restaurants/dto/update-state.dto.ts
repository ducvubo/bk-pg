import { PartialType } from '@nestjs/mapped-types'
import { UpdateVerify } from './update-verify.dto'

export class UpdateState extends PartialType(UpdateVerify) {}
