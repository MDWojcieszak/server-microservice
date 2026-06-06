import { Injectable, Logger } from '@nestjs/common';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { SendCommandDto, StartServerDto } from './dto';

import { ServerSettingsService } from 'src/server-settings/server-settings.service';
import { LogLevel, ProcessStatus, ServerCategory } from 'src/common/enums';
import { ProcessService } from 'src/process/process.service';

@Injectable()
export class MinecraftServerService {
  private readonly logger = new Logger(MinecraftServerService.name);

  constructor(
    private serverSettings: ServerSettingsService,
    private processService: ProcessService,
  ) {}

  private minecraftServerProcess: ChildProcessWithoutNullStreams;
  private processId: string;

  async handleStartServer(dto: StartServerDto) {
    this.logger.log(
      `Start requested (user=${dto.context.userId}, category=${dto.context.categoryId})`,
    );
    const settings = this.serverSettings.getMinecraftServerSettings();
    const res = await this.processService.registerProcess(
      dto.context.categoryId,
      dto.context.userId,
      ServerCategory.MINECRAFT_SERVER,
      'server.start',
    );

    if (!res) {
      this.logger.error('Start aborted: process registration failed');
      return false;
    }
    if (this.isRunning()) {
      this.logger.warn('Start ignored: server is already running');
      this.processService.postStatus(res, ProcessStatus.FAILED);
      return false;
    }

    try {
      this.processId = res;
      this.logger.log(
        `Spawning Minecraft server (process=${res}, memory=${settings.min_memory}-${settings.max_memory}MB)`,
      );
      this.createProcess(settings.min_memory, settings.max_memory);
      const logStream = createWriteStream('server.log', { flags: 'a' });
      this.minecraftServerProcess.stdout.pipe(logStream);
      this.minecraftServerProcess.stderr.pipe(logStream);
      this.setupListeners();
      this.processService.postStatus(res, ProcessStatus.STARTED);
      this.logger.log(
        `Minecraft server started (pid=${this.minecraftServerProcess.pid})`,
      );
      return true;
    } catch (e) {
      this.logger.error(`Failed to start Minecraft server (process=${res})`, e);
      this.processService.postStatus(res, ProcessStatus.FAILED);
      return false;
    }
  }

  // A child process exposes a null exitCode/signalCode only while it is alive;
  // `killed` flips to true only on an explicit .kill(), so it cannot detect a
  // process that ended on its own (stop command, crash, natural exit).
  isRunning(): boolean {
    return (
      !!this.minecraftServerProcess &&
      this.minecraftServerProcess.exitCode === null &&
      this.minecraftServerProcess.signalCode === null
    );
  }

  createProcess(minMemory: number, maxMemory: number) {
    this.minecraftServerProcess = spawn(
      'java',
      [`-Xmx${maxMemory}M`, `-Xms${minMemory}M`, '-jar', 'server.jar', 'nogui'],
      { cwd: 'minecraft/1.20.4', stdio: ['pipe', 'pipe', 'pipe'] },
    );
  }

  handleStopServer() {
    try {
      if (this.minecraftServerProcess) {
        this.sendCommandToMinecraftServer({ command: 'stop' });
      }
    } catch (e) {}
    return true;
  }

  handleKillServer() {
    if (this.minecraftServerProcess) {
      this.minecraftServerProcess.kill();
    }
    return true;
  }

  sendCommandToMinecraftServer(dto: SendCommandDto) {
    if (this.minecraftServerProcess && !this.minecraftServerProcess.killed) {
      this.minecraftServerProcess.stdin.write(`${dto.command}\n`);
    } else {
      this.logger.error('Minecraft server process is not running.');
    }
  }

  setupListeners() {
    if (!this.minecraftServerProcess || this.minecraftServerProcess.killed) {
      this.killProcess();
      return this.processService.postStatus(
        this.processId,
        ProcessStatus.FAILED,
      );
    }
    this.minecraftServerProcess.on('error', () => {
      this.killProcess();
      return this.processService.postStatus(
        this.processId,
        ProcessStatus.FAILED,
      );
    });

    // Authoritative lifecycle signal: clear the reference so a new server can
    // be started once the current process has fully exited.
    this.minecraftServerProcess.on('exit', (code, signal) => {
      this.logger.log(
        `Minecraft server exited (code=${code}, signal=${signal})`,
      );
      this.minecraftServerProcess = null;
    });
    this.minecraftServerProcess.stdout.on('data', (data) => {
      return this.processMessage(data.toString());
    });

    this.minecraftServerProcess.stdout.on('end', () => {
      return this.processService.postStatus(
        this.processId,
        ProcessStatus.ENDED,
      );
    });

    this.minecraftServerProcess.stdout.on('close', () => {
      return this.processService.postStatus(
        this.processId,
        ProcessStatus.CLOSED,
      );
    });
  }

  processMessage(message: string) {
    // Raw console lines are streamed to the backend via process.register-log.
    // The backend derives command progress/status from its configured markers,
    // so the agent does not compute percentages here.
    let level = LogLevel.LOG;
    if (message.includes('\u001b[32m')) {
      message = message.replace('\u001b[32m', '');
      level = LogLevel.SUCCESS;
    }
    if (message.includes('\u001b[33m')) {
      message = message.replace('\u001b[33m', '');
      level = LogLevel.WARNING;
    }
    if (message.includes('INFO')) {
      level = LogLevel.SUCCESS;
    }
    if (message.includes('WARN')) {
      level = LogLevel.WARNING;
    }
    this.processService.postMessage(this.processId, message, level);
  }

  killProcess() {
    if (!this.minecraftServerProcess || this.minecraftServerProcess.killed)
      return;
    this.minecraftServerProcess.kill();
  }
}
