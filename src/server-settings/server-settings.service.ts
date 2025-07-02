import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { MinecraftServerConfig, ServerCategory } from 'src/common/enums';
import { SetSettingDto } from 'src/server-settings/dto';

@Injectable()
export class ServerSettingsService {
  constructor(
    @Inject('HUB') private hubClient: ClientProxy,
    private config: ConfigService,
  ) {}
  private serverSettings = {
    [ServerCategory.MINECRAFT_SERVER]: {
      [MinecraftServerConfig.MAX_MEMORY]: 1024,
      [MinecraftServerConfig.MIN_MEMORY]: 1024,
    },
  };

  handleSetSettings(dto: SetSettingDto) {
    if (this.config.get<string>('SERVER_NAME') !== dto.serverName) return;
    console.log(dto);
    const type = typeof this.serverSettings[dto.category][dto.name];
    if (type === 'undefined')
      throw new ForbiddenException('Setting does not exist!');
    if (type === 'number') {
      this.serverSettings[dto.category][dto.name] = Number(dto.value);
    } else {
      this.serverSettings[dto.category][dto.name] = dto.value;
    }
  }

  getMinecraftServerSettings() {
    return this.serverSettings[ServerCategory.MINECRAFT_SERVER];
  }

  getAll() {
    return this.serverSettings;
  }
}
