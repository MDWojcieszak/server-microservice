import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class SystemPowerService {
  async shutdown(): Promise<void> {
    try {
      await execAsync('shutdown now');
    } catch (error) {
      throw new InternalServerErrorException('Failed to shut down the system.');
    }
  }

  async reboot(): Promise<void> {
    try {
      await execAsync('reboot');
    } catch (error) {
      throw new InternalServerErrorException('Failed to reboot the system.');
    }
  }
}
