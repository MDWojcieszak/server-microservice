import { Module } from '@nestjs/common';
import { HubConnectionModule } from 'src/hub-connection/hub-connection.module';
import { ServerTransferController } from './server-transfer.controller';
import { ServerTransferService } from './server-transfer.service';

@Module({
  imports: [HubConnectionModule],
  controllers: [ServerTransferController],
  providers: [ServerTransferService],
  exports: [ServerTransferService],
})
export class ServerTransferModule {}
