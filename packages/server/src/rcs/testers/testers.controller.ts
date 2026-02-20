import { Controller, Post, Param } from '@nestjs/common';

@Controller('v1/phones/:phone/testers')
export class TestersController {
  @Post()
  invite(@Param('phone') phone: string) {
    return { name: `phones/${phone}/testers` };
  }
}
