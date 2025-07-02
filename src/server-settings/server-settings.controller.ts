import { BadRequestException, Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { SetSettingDto } from './dto';
import { validate } from 'class-validator';
import { ServerSettingsService } from 'src/server-settings/server-settings.service';

@Controller('server-settings')
export class ServerSettingsController {
  constructor(private settingsService: ServerSettingsService) {}

  @EventPattern('setting.set')
  async setSettings(dto: SetSettingDto) {
    const errors = await validate(dto);

    if (errors.length > 0) {
      return new BadRequestException(errors);
    }
    this.settingsService.handleSetSettings(dto);
  }
}
