/* eslint-disable */
/**
 * AUTO-GENERATED from src/api/asyncapi.yaml — DO NOT EDIT BY HAND.
 * Regenerate with: npm run gen:messaging
 */
export type CommandType = ("MESSAGE" | "EVENT")

export interface ServerCommandDto {
/**
 * Command identifier. Stored as ServerCommand.value and used verbatim as the RMQ pattern of the {commandValue} channel (i.e. value === commandName).
 */
commandName: string
commandType: CommandType
category: string
}

export interface RegisterServerCommandsDto {
serverName: string
commands: ServerCommandDto[]
}

export type CommandStatus = ("ENABLED" | "DISABLED" | "RUNNING")

export type CommandRuntimeStatus = ("IDLE" | "STARTING" | "RUNNING" | "STOPPING" | "STOPPED" | "ERROR")

export interface UpdateServerCommandDto {
serverName: string
commandName: string
category: string
runningProgress?: number
status?: CommandStatus
runtimeStatus?: CommandRuntimeStatus
}

export type ServerProcessStatus = ("UNKNOWN" | "STARTED" | "ONGOING" | "CLOSED" | "ENDED" | "FAILED")

export interface RegisterProcessDto {
categoryId: string
userId: string
name: string
commandValue?: string
status?: ServerProcessStatus
}

export type ProcessLogLevel = ("LOG" | "SUCCESS" | "WARNING" | "ERROR")

export interface RegisterProcessLogDto {
processId: string
message: string
level?: ProcessLogLevel
}

export interface ProcessStatusDto {
processId: string
status: ServerProcessStatus
}

export interface HeartbeatDto {
name: string
}

export type ServerStatus = ("UNKNOWN" | "OFFLINE" | "ONLINE" | "ERROR" | "MAINTENANCE" | "WAKE_IN_PROGRESS" | "SHUTDOWN_IN_PROGRESS")

export type Role = ("USER" | "MODERATOR" | "ADMIN" | "OWNER")

export interface UserDto {
email: string
firstName?: string
lastName?: string
role: Role
}

export interface CpuDto {
cores?: number
physicalCores?: number
currentLoad: number
currentLoadUser: number
currentLoadSystem: number
}

export interface MemoryDto {
total?: number
free?: number
}

export type DiskType = ("HDD" | "SSD" | "NVME")

export interface DiskInfoDto {
fs?: string
type?: string
used?: number
available?: number
name?: string
mediaType?: DiskType
}

export interface ServerPropertiesDto {
uptime?: number
status?: ServerStatus
lastSeenAt?: string
isOnline?: boolean
startedBy?: UserDto
cpuInfo?: CpuDto
memoryInfo?: MemoryDto
diskInfo?: DiskInfoDto[]
}

export interface UpdateServerPropertiesDto {
name: string
properties: ServerPropertiesDto
}

export interface RegisterServerDto {
name: string
ipAddress: string
macAddress: string
diskCount: number
cpu: CpuDto
queueName: string
}

export interface GetServerTransfersForAgentDto {
/**
 * Name of the server (Server.name) requesting its transfer tasks.
 */
serverName: string
}

export type ServerTransferStatus = ("IDLE" | "RUNNING" | "SUCCESS" | "FAILED")

export interface PatchServerTransferProgressDto {
categoryId: string
transferName: string
status?: ServerTransferStatus
queuedFiles?: number
queuedBytes?: number
sentFiles?: number
sentBytes?: number
currentProcessId?: string
lastProcessId?: string
lastError?: string
lastRunAt?: string
lastSuccessAt?: string
}

export type SettingType = ("STRING" | "NUMBER")

export interface ServerSettingsDto {
settingName: string
settingValue: string
settingType: SettingType
category: string
}

export interface RegisterServerSettingsDto {
serverName: string
settings: ServerSettingsDto[]
}

export type ServerTransferMode = ("MOVE" | "COPY")

export interface ServerTransferResponse {
id: string
serverCategoryId: string
name: string
description?: string
originPath: string
targetPath: string
agentLogPath?: string
enableMoveBackup: boolean
moveBackupPath?: string
mode: ServerTransferMode
status: ServerTransferStatus
bwLimitKbps?: number
secondsStart: number
secondsStop: number
isEnabled: boolean
queuedFiles: number
queuedBytes: number
sentFiles: number
sentBytes: number
currentProcessId?: string
lastProcessId?: string
lastRunAt?: string
lastSuccessAt?: string
lastError?: string
createdAt: string
updatedAt: string
}

export interface PowerServerContext {
serverId: string
}

export interface PowerServerEvent {
context: PowerServerContext
}

export interface CommandContext {
serverId: string
categoryId: string
userId: string
}

export interface SendCommandEvent {
context: CommandContext
}

export interface SetSettingEvent {
serverName: string
name: string
value: string
category: string
}

export interface SetServerTransferEvent {
serverName: string
categoryValue: string
transferName: string
transfer: ServerTransferResponse
}

export type ServerTransferGetReply = ServerTransferResponse[]
