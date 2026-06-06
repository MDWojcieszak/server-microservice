import { Controller, Logger } from '@nestjs/common';
import { SystemPowerService } from './system-power.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PowerServerDto } from './dto';

@Controller('system/power')
export class SystemPowerController {
  private readonly logger = new Logger(SystemPowerController.name);

  constructor(private readonly powerService: SystemPowerService) {}

  // Backend -> Server (channel: server.shutdown, PowerServerEvent)
  @MessagePattern('server.shutdown')
  async handleShutdown(@Payload() event: PowerServerDto) {
    this.logger.log(
      `Shutdown requested for server ${event?.context?.serverId}`,
    );
    await this.powerService.shutdown();
    return { status: 'shutdown initiated' };
  }

  // Backend -> Server (channel: server.reboot, PowerServerEvent)
  @MessagePattern('server.reboot')
  async handleReboot(@Payload() event: PowerServerDto) {
    this.logger.log(`Reboot requested for server ${event?.context?.serverId}`);
    await this.powerService.reboot();
    return { status: 'reboot initiated' };
  }
}
