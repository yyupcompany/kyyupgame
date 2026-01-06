/**
 * 数据同步相关API端点
 */
import { API_PREFIX } from './base';

// 数据同步接口
export const SYNC_ENDPOINTS = {
  BASE: `${API_PREFIX}sync`,
  DATA_SYNC: `${API_PREFIX}sync`,
  STATUS: `${API_PREFIX}sync/status`,
  CONFIG: `${API_PREFIX}sync/config`,
  HISTORY: `${API_PREFIX}sync/history`,
  QUEUE: `${API_PREFIX}sync/queue`,
  CONFLICTS: `${API_PREFIX}sync/conflicts`,
  RESOLVE_CONFLICT: (conflictId: string | number) => `${API_PREFIX}sync/conflicts/${conflictId}/resolve`,

  // 批量同步
  BATCH_SYNC: `${API_PREFIX}sync/batch`,
  SYNC_DEVICE: (deviceId: string) => `${API_PREFIX}sync/device/${deviceId}`,
  SYNC_DATA_TYPE: (dataType: string) => `${API_PREFIX}sync/type/${dataType}`,

  // 同步设置
  SETTINGS: `${API_PREFIX}sync/settings`,
  AUTO_SYNC: `${API_PREFIX}sync/auto`,
  MANUAL_SYNC: `${API_PREFIX}sync/manual`,

  // 同步状态查询
  LAST_SYNC: `${API_PREFIX}sync/last`,
  PENDING_CHANGES: `${API_PREFIX}sync/pending`,
  SYNC_PROGRESS: (syncId: string) => `${API_PREFIX}sync/progress/${syncId}`,

  // 冲突解决
  CONFLICT_RESOLUTION: `${API_PREFIX}sync/resolve`,
  MERGE_STRATEGIES: `${API_PREFIX}sync/merge-strategies`,
} as const;

// 同步相关数据类型
export interface SyncRequest {
  key: string
  data: any
  action: 'set' | 'delete'
  timestamp?: number
  deviceId?: string
}

export interface SyncResponse {
  success: boolean
  syncId?: string
  conflicts?: Array<{
    id: string
    key: string
    localValue: any
    remoteValue: any
    timestamp: number
  }>
  message?: string
}

export interface SyncStatus {
  online: boolean
  lastSync?: string
  pendingChanges: number
  conflicts: number
  syncInProgress: boolean
}