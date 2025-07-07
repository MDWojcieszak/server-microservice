import { Controller, Post } from '@nestjs/common';
import { SystemPowerService } from './system-power.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('system/power')
export class SystemPowerController {
  constructor(private readonly powerService: SystemPowerService) {}

  @MessagePattern('system.shutdown')
  async handleShutdown() {
    await this.powerService.shutdown();
    return { status: 'shutdown initiated' };
  }

  @MessagePattern('system.reboot')
  async handleReboot() {
    await this.powerService.reboot();
    return { status: 'reboot initiated' };
  }
}
