import { BadRequestException, Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ServerTransferService } from './server-transfer.service';
import { SetServerTransferDto } from './dto';

@Controller('server-transfer')
export class ServerTransferController {
  constructor(private readonly transferService: ServerTransferService) {}

  // Backend -> Server (channel: server.transfer.set, SetServerTransferEvent)
  @EventPattern('server.transfer.set')
  async setTransfer(@Payload() payload: SetServerTransferDto) {
    const dto = plainToInstance(SetServerTransferDto, payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return new BadRequestException(errors);
    }
    this.transferService.handleSetTransfer(dto);
  }
}
