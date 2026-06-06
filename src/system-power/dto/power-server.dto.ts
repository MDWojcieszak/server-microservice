import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PowerServerContext, PowerServerEvent } from 'src/generated/messaging';

export class PowerServerContextDto implements PowerServerContext {
  @IsString()
  @IsNotEmpty()
  serverId: string;
}

export class PowerServerDto implements PowerServerEvent {
  @ValidateNested()
  @Type(() => PowerServerContextDto)
  context: PowerServerContextDto;
}
