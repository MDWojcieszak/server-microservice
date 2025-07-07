import { Systeminformation } from 'systeminformation';

export class RegisterServerEvent {
  constructor(
    public readonly name: string,
    public readonly ipAddress: string,
    public readonly macAddress: string,
    public readonly diskCount: number,
    public readonly cpu: Systeminformation.CpuData,
  ) {}
}
