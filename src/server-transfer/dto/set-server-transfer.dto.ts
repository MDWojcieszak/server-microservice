import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import {
  ServerTransferResponse,
  SetServerTransferEvent,
} from 'src/generated/messaging';

// Inbound payload of the `server.transfer.set` channel (Backend -> Server).
// The nested `transfer` is accepted as-is (kept whole by the whitelist pipe via
// @IsObject). Per-field validation can be added together with the real transfer
// runner; today the runner is a stub, so the envelope check is enough.
export class SetServerTransferDto implements SetServerTransferEvent {
  @IsString()
  @IsNotEmpty()
  serverName: string;

  @IsString()
  @IsNotEmpty()
  categoryValue: string;

  @IsString()
  @IsNotEmpty()
  transferName: string;

  @IsObject()
  transfer: ServerTransferResponse;
}
