import { Module } from '@nestjs/common';
import { MinecraftServerService } from './minecraft-server.service';
import { MinecraftServerController } from './minecraft-server.controller';
import { HubConnectionModule } from 'src/hub-connection/hub-connection.module';
import { ServerSettingsModule } from 'src/server-settings/server-settings.module';
import { ProcessModule } from 'src/process/process.module';

@Module({
  imports: [HubConnectionModule, ServerSettingsModule, ProcessModule],
  providers: [MinecraftServerService],
  controllers: [MinecraftServerController],
})
export class MinecraftServerModule {}
