import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LogLevel, ProcessStatus } from 'src/common/enums';
import { ServerProcessStatus } from 'src/generated/messaging';
import {
  ProcessMessageEvent,
  ProcessStatusEvent,
  RegisterProcessEvent,
} from 'src/process/events';

@Injectable()
export class ProcessService {
  constructor(@Inject('HUB') private hubClient: ClientProxy) {}

  async registerProcess(
    categoryId: string,
    userId: string,
    name: string,
    commandValue?: string,
    status?: ServerProcessStatus,
  ) {
    return await firstValueFrom(
      this.hubClient.send(
        'process.register',
        new RegisterProcessEvent(
          categoryId,
          userId,
          name,
          commandValue,
          status,
        ),
      ),
    );
  }

  postStatus(processId: string, status: ProcessStatus) {
    this.hubClient.emit(
      'process.status',
      new ProcessStatusEvent(processId, status),
    );
  }

  postMessage(processId: string, message: string, level?: LogLevel) {
    this.hubClient.emit(
      'process.register-log',
      new ProcessMessageEvent(processId, message, level),
    );
  }
}
