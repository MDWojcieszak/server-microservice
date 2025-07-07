import { Module } from '@nestjs/common';
import { SystemPowerController } from 'src/system-power/system-power.controller';
import { SystemPowerService } from 'src/system-power/system-power.service';

@Module({
  controllers: [SystemPowerController],
  providers: [SystemPowerService],
})
export class SystemPowerModule {}
