import { Module } from '@nestjs/common';

import { ServerSettingsController } from 'src/server-settings/server-settings.controller';
import { ServerSettingsService } from 'src/server-settings/server-settings.service';

@Module({
  providers: [ServerSettingsService],
  controllers: [ServerSettingsController],
  exports: [ServerSettingsService],
})
export class ServerSettingsModule {}
