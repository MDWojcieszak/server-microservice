import { Controller } from '@nestjs/common';
import { MinecraftServerService } from './minecraft-server.service';
import { MessagePattern } from '@nestjs/microservices';
import { StartServerDto } from 'src/minecraft-server/dto/start-server.dto';
import { Command } from 'src/common/decorators';
import { CommandType, ServerCategory } from 'src/common/enums';

@Controller('minecraft-server')
export class MinecraftServerController {
  constructor(private minecraftService: MinecraftServerService) {}

  @Command('server.start', ServerCategory.MINECRAFT_SERVER, CommandType.MESSAGE)
  @MessagePattern('server.start')
  async startServer(dto: StartServerDto) {
    return this.minecraftService.handleStartServer(dto);
  }

  @Command('server.stop', ServerCategory.MINECRAFT_SERVER, CommandType.MESSAGE)
  @MessagePattern('server.stop')
  stopServer() {
    return this.minecraftService.handleStopServer();
  }

  @Command('server.kill', ServerCategory.MINECRAFT_SERVER, CommandType.EVENT)
  @MessagePattern('server.kill')
  killServer() {
    return this.minecraftService.handleKillServer();
  }
}
