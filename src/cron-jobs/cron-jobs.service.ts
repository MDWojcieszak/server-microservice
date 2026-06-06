import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { SystemUsageService } from 'src/system-usage/system-usage.service';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);
  private isRegistered = false;

  constructor(
    @Inject('HUB') private hubClient: ClientProxy,
    private systemUsage: SystemUsageService,
    private config: ConfigService,
  ) {}

  @OnEvent('system.registered')
  handleSystemRegistered() {
    this.isRegistered = true;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleLoad() {
    if (!this.isRegistered) return;
    try {
      const cpuInfo = await this.systemUsage.getSystemLoad();
      const uptime = await this.systemUsage.getSystemUptime();
      await firstValueFrom(
        this.hubClient.send('server.raport-usage', {
          name: this.config.get<string>('SERVER_NAME'),
          properties: { cpuInfo, uptime },
        }),
      );
    } catch (e) {
      this.logger.error('Failed to send load report', e);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleMemory() {
    if (!this.isRegistered) return;
    try {
      const memoryInfo = await this.systemUsage.getMemoryInfo();
      await firstValueFrom(
        this.hubClient.send('server.raport-usage', {
          name: this.config.get<string>('SERVER_NAME'),
          properties: { memoryInfo },
        }),
      );
    } catch (e) {
      this.logger.error('Failed to send memory report', e);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleDisk() {
    if (!this.isRegistered) return;
    try {
      const diskInfo = await this.systemUsage.getDiskInfo();
      await firstValueFrom(
        this.hubClient.send('server.raport-usage', {
          name: this.config.get<string>('SERVER_NAME'),
          properties: { diskInfo },
        }),
      );
    } catch (e) {
      this.logger.error('Failed to send disk report', e);
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async sendHeartbeat() {
    if (!this.isRegistered) return;
    try {
      await firstValueFrom(
        this.hubClient.emit('server.heartbeat', {
          name: this.config.get<string>('SERVER_NAME'),
        }),
      );
    } catch (e) {
      this.logger.error('Failed to send heartbeat', e);
    }
  }
}
