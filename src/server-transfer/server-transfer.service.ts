import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GetServerTransfersForAgentDto,
  PatchServerTransferProgressDto,
  ServerTransferGetReply,
  ServerTransferResponse,
} from 'src/generated/messaging';
import { SetServerTransferDto } from './dto';

@Injectable()
export class ServerTransferService {
  private readonly logger = new Logger(ServerTransferService.name);

  // Transfer task configs known to this agent, keyed by `${categoryValue}:${transferName}`.
  private readonly transfers = new Map<string, ServerTransferResponse>();

  constructor(
    @Inject('HUB') private readonly hubClient: ClientProxy,
    private readonly config: ConfigService,
  ) {}

  private key(categoryValue: string, transferName: string) {
    return `${categoryValue}:${transferName}`;
  }

  private get serverName() {
    return this.config.get<string>('SERVER_NAME');
  }

  // Backend -> Server: store/replace a single transfer task configuration.
  handleSetTransfer(dto: SetServerTransferDto) {
    if (dto.serverName !== this.serverName) return;
    this.transfers.set(
      this.key(dto.categoryValue, dto.transferName),
      dto.transfer,
    );
    this.logger.log(
      `Stored transfer "${dto.transferName}" (category=${dto.categoryValue})`,
    );
  }

  // Server -> Backend (request/reply): fetch all transfer tasks assigned to this agent.
  // Response type is documented via x-reply in the contract (ServerTransferResponse[]).
  @OnEvent('system.registered')
  async requestTransfers() {
    try {
      const request: GetServerTransfersForAgentDto = {
        serverName: this.serverName,
      };
      const transfers = await firstValueFrom(
        this.hubClient.send<
          ServerTransferGetReply,
          GetServerTransfersForAgentDto
        >('server.transfer.get', request),
      );

      this.transfers.clear();
      for (const transfer of transfers ?? []) {
        this.transfers.set(
          this.key(transfer.serverCategoryId, transfer.name),
          transfer,
        );
      }
      this.logger.log(
        `Loaded ${this.transfers.size} transfer task(s) from backend`,
      );
    } catch (e) {
      this.logger.error('Failed to fetch transfer tasks', e);
    }
  }

  // Server -> Backend (fire-and-forget): report transfer progress/status.
  //
  // TODO(transfer-runner): the physical file transfer is not implemented yet.
  // The contract defines the task fields (originPath/targetPath, mode MOVE|COPY,
  // bwLimitKbps, enableMoveBackup/moveBackupPath, secondsStart/secondsStop window,
  // isEnabled) but not the execution mechanism — that is agent behavior, and the tool
  // (rsync on Linux vs robocopy on Windows) was deferred. The runner will schedule
  // enabled transfers within their window, register a process (process.register),
  // stream logs, and call postProgress(...) with queued/sent files & bytes and status.
  postProgress(progress: PatchServerTransferProgressDto) {
    this.hubClient.emit('server.transfer.progress', progress);
  }

  getAll(): ServerTransferResponse[] {
    return [...this.transfers.values()];
  }
}
