import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { SystemUsageService } from 'src/system-usage/system-usage.service';

@Injectable()
export class CronJobsService {
  constructor(
    @Inject('HUB') private hubClient: ClientProxy,
    private systemUsage: SystemUsageService,
    private config: ConfigService,
  ) {}
  private isRegistered = false;

  @OnEvent('system.registered')
  handleSystemRegistered() {
    this.isRegistered = true;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleLoad() {
    try {
      const serverName = this.config.get<string>('SERVER_NAME');
      await this.handleLoadRaport(serverName);
    } catch (error) {
      console.error('Error executing cron job:', error);
    }
  }

  async handleLoadRaport(serverName: string) {
    try {
      if (!this.isRegistered) return;
      Logger.log('LOAD RAPORT');

      const systemLoad = await this.systemUsage.getSystemLoad();
      const uptime = await this.systemUsage.getSystemUptime();
      console.log(
        await firstValueFrom(
          this.hubClient.send('server.raport-usage', {
            properties: {
              cpuInfo: systemLoad,
              uptime,
            },
            name: serverName,
          }),
        ),
      );
    } catch (e) {
      Logger.error('Failed to send load report', e);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleMemory() {
    try {
      const serverName = this.config.get<string>('SERVER_NAME');
      if (!this.isRegistered) return;
      this.handleMemoryRaport(serverName);
    } catch (error) {
      console.error('Error executing cron job:', error);
    }
  }

  async handleMemoryRaport(serverName: string) {
    try {
      if (!this.isRegistered) return;
      Logger.log('MEMORY RAPORT');

      const memoryInfo = await this.systemUsage.getMemoryInfo();
      console.log(
        await firstValueFrom(
          this.hubClient.send('server.raport-usage', {
            properties: { memoryInfo },
            name: serverName,
          }),
        ),
      );
    } catch (e) {
      Logger.error('Failed to send memory report', e);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleDisk() {
    try {
      const serverName = this.config.get<string>('SERVER_NAME');
      if (!this.isRegistered) return;
      this.handleDiskRaport(serverName);
    } catch (error) {
      console.error('Error executing cron job:', error);
    }
  }

  async handleDiskRaport(serverName: string) {
    try {
      if (!this.isRegistered) return;
      Logger.log('DISK RAPORT');

      const diskInfo = await this.systemUsage.getDiskInfo();
      console.log(
        await firstValueFrom(
          this.hubClient.send('server.raport-usage', {
            properties: { diskInfo },
            name: serverName,
          }),
        ),
      );
    } catch (e) {
      Logger.error('Failed to send disk report', e);
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async sendHeartbeat() {
    try {
      if (!this.isRegistered) return;

      const serverName = this.config.get<string>('SERVER_NAME');
      Logger.debug(`Sending heartbeat for ${serverName}`);
      await firstValueFrom(
        this.hubClient.emit('server.heartbeat', {
          name: serverName,
        }),
      );
    } catch (e) {
      Logger.error('Failed to send heartbeat', e);
    }
  }
}
