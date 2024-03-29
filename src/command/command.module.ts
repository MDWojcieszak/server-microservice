import { Module } from '@nestjs/common';
import { DiscoveryModule, MetadataScanner } from '@nestjs/core';
import { CommandCollectorSerice } from 'src/command/command-collector.service';

@Module({
  imports: [DiscoveryModule],
  providers: [CommandCollectorSerice],
  exports: [CommandCollectorSerice],
})
export class CommandModule {}
