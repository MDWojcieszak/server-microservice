import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CommandCollectorSerice } from 'src/command/command-collector.service';
import { ServerStatus } from 'src/common/enums';
import { ServerSettingsService } from 'src/server-settings/server-settings.service';
import {
  RegisterServerCommandsEvent,
  RegisterServerSettingsEvent,
  ServerSetting,
  SettingType,
} from 'src/system-register/events';
import { RegisterServerEvent } from 'src/system-register/events/register-server.event';
import { SystemUsageService } from 'src/system-usage/system-usage.service';

@Injectable()
export class SystemRegisterService {
  constructor(
    private config: ConfigService,
    private commandCollector: CommandCollectorSerice,
    private settingsService: ServerSettingsService,
    private systemUsage: SystemUsageService,
    private eventEmmiter: EventEmitter2,
    @Inject('HUB') private hubClient: ClientProxy,
  ) {}

  async handleRegistration() {
    try {
      const serverName = this.config.get<string>('SERVER_NAME');

      Logger.log('SERVER REGISTRATION');
      const diskCount = (await this.systemUsage.getDiskInfo()).length;
      const ipAddress = await this.systemUsage.getPublicIP();
      const cpu = await this.systemUsage.getCpuInfo();
      await firstValueFrom(
        this.hubClient.send(
          'server.register',
          new RegisterServerEvent(serverName, ipAddress, diskCount, cpu),
        ),
      );
      await this.handleCommandRegistration(serverName);
      await this.handleSettingsRegistration(serverName);
      this.eventEmmiter.emit('system.registered');
    } catch (e) {
      Logger.error('REGISTRATION FAILED', e);
    }
  }

  async handleCommandRegistration(serverName: string) {
    try {
      Logger.log('COMMANDS REGISTRATION');
      const commands = this.commandCollector.getAll();

      await firstValueFrom(
        this.hubClient.send(
          'commands.register',
          new RegisterServerCommandsEvent(serverName, commands),
        ),
      );
    } catch (e) {
      Logger.error('COMMAND_REGISTRATION_FAILED', e);
    }
  }

  async handleSettingsRegistration(serverName: string) {
    try {
      Logger.log('SETTINGS REGISTRATION');
      const settings = this.settingsService.getAll();
      const settingsTable = [];
      for (const category in settings) {
        for (const name in settings[category]) {
          const type = typeof settings[category][name];
          const settingEvent: ServerSetting = {
            category,
            settingName: name,
            settingType:
              type === 'number' ? SettingType.NUMBER : SettingType.STRING,
            settingValue: settings[category][name].toString(),
          };
          settingsTable.push(settingEvent);
        }
      }
      await firstValueFrom(
        this.hubClient.send(
          'settings.register',
          new RegisterServerSettingsEvent(serverName, settingsTable),
        ),
      );
    } catch (e) {
      Logger.error('SETTINGS_REGISTRATION_FAILED', e);
    }
  }

  async onApplicationBootstrap() {
    this.handleRegistration();
  }
}
