import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PublicNetworkInfo } from 'src/common/types';
import * as si from 'systeminformation';

@Injectable()
export class SystemUsageService {
  constructor(private config: ConfigService) {}
  async getSystemLoad() {
    try {
      const load = await si.currentLoad();
      return load;
    } catch (error) {
      console.error('Error retrieving system information:', error);
      throw error;
    }
  }

  async getMemoryInfo() {
    try {
      const memData = await si.mem();
      return memData;
    } catch (error) {
      console.error('Error retrieving system information:', error);
      throw error;
    }
  }

  async getCpuInfo() {
    try {
      const cpuData = await si.cpu();
      return cpuData;
    } catch (error) {
      console.error('Error retrieving system information:', error);
      throw error;
    }
  }

  async getSystemUptime() {
    try {
      const timeInfo = si.time();
      const uptime = Math.floor(timeInfo.uptime);
      return uptime;
    } catch (error) {
      console.error('Error retrieving system uptime:', error);
      throw error;
    }
  }
  async getDiskInfo() {
    try {
      const diskData = await si.fsSize();
      return diskData;
    } catch (error) {
      console.error('Error retrieving system information:', error);
      throw error;
    }
  }

  async getPublicNetworkInfo(): Promise<PublicNetworkInfo> {
    try {
      const networkInterfaces = await si.networkInterfaces();

      let publicInterface:
        | si.Systeminformation.NetworkInterfacesData
        | undefined;

      if (Array.isArray(networkInterfaces)) {
        publicInterface = networkInterfaces.find(
          (i) => i.ip4 && i.ip4 !== '127.0.0.1' && i.ip4 !== '::1',
        );
      }

      if (!publicInterface) {
        throw new Error('Public network interface not found.');
      }

      return {
        ip: publicInterface.ip4,
        mac: publicInterface.mac,
      };
    } catch (error) {
      throw new Error(`Failed to get public network info: ${error.message}`);
    }
  }
}
