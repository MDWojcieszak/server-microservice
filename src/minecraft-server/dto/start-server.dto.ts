import { IsObject } from 'class-validator';
import { CommandContextDto } from 'src/common/dto';

export class StartServerDto {
  @IsObject({ context: CommandContextDto })
  context: CommandContextDto;
}
