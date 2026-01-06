/**
 * 数据备份策略配置
 *
 * 定义数据备份的规则和策略
 */

import { TIME } from '../constants/business.constants';

/**
 * 备份类型
 */
export enum BackupType {
  FULL = 'FULL',           // 完全备份
  INCREMENTAL = 'INCREMENTAL', // 增量备份
  DIFFERENTIAL = 'DIFFERENTIAL' // 差异备份
}

/**
 * 备份频率
 */
export enum BackupFrequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

/**
 * 备份保留策略
 */
export interface BackupRetentionPolicy {
  hourly: number;    // 保留小时数
  daily: number;     // 保留天数
  weekly: number;    // 保留周数
  monthly: number;   // 保留月数
}

/**
 * 备份配置
 */
export interface BackupConfig {
  enabled: boolean;
  type: BackupType;
  frequency: BackupFrequency;
  retention: BackupRetentionPolicy;
  compression: boolean;
  encryption: boolean;
  destination: string;
  maxFileSize: number;
}

/**
 * 默认备份策略
 */
export const DEFAULT_BACKUP_POLICY: BackupConfig = {
  enabled: process.env.ENABLE_AUTO_BACKUP === 'true',
  type: BackupType.INCREMENTAL,
  frequency: BackupFrequency.DAILY,
  retention: {
    hourly: 24,     // 保留24小时
    daily: 7,       // 保留7天
    weekly: 4,      // 保留4周
    monthly: 3      // 保留3个月
  },
  compression: true,
  encryption: true,
  destination: process.env.BACKUP_DESTINATION || './backups',
  maxFileSize: 1024 * 1024 * 1024 // 1GB
};

/**
 * 需要备份的数据表
 */
export const BACKUP_TABLES = [
  // 核心业务数据
  'users',
  'students',
  'classes',
  'kindergartens',

  // 权限数据
  'roles',
  'permissions',
  'user_roles',
  'role_permissions',

  // 关系数据
  'parent_student_relations',

  // 活动数据
  'activities',
  'activity_participants',

  // 通知数据
  'notifications',

  // 任务数据
  'tasks',

  // 招生数据
  'enrollment_applications',

  // 配置数据
  'system_configs'
];

/**
 * 排除备份的表（临时表、缓存表等）
 */
export const EXCLUDE_BACKUP_TABLES = [
  'sessions',
  'temp_tables',
  'cache'
];

/**
 * 生成备份文件名
 */
export function generateBackupFileName(type: BackupType, timestamp?: Date): string {
  const date = timestamp || new Date();
  const dateStr = date.toISOString().replace(/[:.]/g, '-').split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `backup_${type}_${dateStr}_${timeStr}.sql`;
}

/**
 * 生成备份命令
 */
export function generateBackupCommand(config: BackupConfig): string {
  const {
    type,
    compression,
    destination,
    maxFileSize
  } = config;

  let command = 'mysqldump';

  // 完全备份
  if (type === BackupType.FULL) {
    command += ' --all-databases';
  } else {
    // 增量/差异备份（只备份指定表）
    command += ` ${BACKUP_TABLES.join(' ')}`;
  }

  // 压缩
  if (compression) {
    command += ' | gzip';
  }

  // 输出文件
  const fileName = generateBackupFileName(type);
  command += ` > ${destination}/${fileName}`;

  return command;
}

/**
 * 清理过期备份
 */
export function cleanupOldBackups(destination: string, retention: BackupRetentionPolicy): string[] {
  const now = Date.now();
  const commands: string[] = [];

  // 清理超过保留期限的备份
  const retentionMs = {
    hourly: retention.hourly * TIME.HOUR,
    daily: retention.daily * TIME.DAY,
    weekly: retention.weekly * TIME.WEEK,
    monthly: retention.monthly * TIME.MONTH
  };

  // 生成清理命令（需要根据实际文件系统实现）
  // 这里只是示例

  return commands;
}

/**
 * 导出配置
 */
export default {
  DEFAULT_BACKUP_POLICY,
  BACKUP_TABLES,
  EXCLUDE_BACKUP_TABLES,
  generateBackupFileName,
  generateBackupCommand,
  cleanupOldBackups
};
