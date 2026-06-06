import {
  RegisterProcessDto,
  ServerProcessStatus,
} from 'src/generated/messaging';

export class RegisterProcessEvent implements RegisterProcessDto {
  constructor(
    public readonly categoryId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly commandValue?: string,
    public readonly status?: ServerProcessStatus,
  ) {}
}
