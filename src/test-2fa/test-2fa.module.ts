import { Module } from '@nestjs/common';
import { Test2faService } from './test-2fa.service';
import { Test2faController } from './test-2fa.controller';

@Module({
  controllers: [Test2faController],
  providers: [Test2faService],
})
export class Test2faModule {}
