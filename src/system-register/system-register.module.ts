import { Module } from '@nestjs/common';
import { SystemRegisterService } from './system-register.service';
import { SystemRegisterController } from './system-register.controller';
import { HubConnectionModule } from 'src/hub-connection/hub-connection.module';
import { SystemUsageModule } from 'src/system-usage/system-usage.module';
import { CommandModule } from 'src/command/command.module';
import { ServerSettingsModule } from 'src/server-settings/server-settings.module';

@Module({
  imports: [
    HubConnectionModule,
    SystemUsageModule,
    CommandModule,
    ServerSettingsModule,
  ],
  providers: [SystemRegisterService],
  controllers: [SystemRegisterController],
  exports: [SystemRegisterService],
})
export class SystemRegisterModule {}
