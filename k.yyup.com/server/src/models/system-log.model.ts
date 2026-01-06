import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  OTHER = 'other',
}

export enum SystemLogType {
  OPERATION = 'operation',
  SYSTEM = 'system',
  ERROR = 'error',
}

export enum LogCategory {
  USER = 'user',
  SYSTEM = 'system',
  DATABASE = 'database',
  SECURITY = 'security',
}

export enum SystemLogStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}


export interface SystemLogAttributes {
  id: number;
  level: LogLevel;
  operationType: OperationType;
  moduleName: string;
  message: string;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  userId: number | null;
  type?: SystemLogType;
  category?: LogCategory;
  status?: SystemLogStatus;
  username?: string;
  action?: string;
  method?: string;
  requestMethod?: string;
  requestUrl?: string;
  path?: string;
  responseStatus?: number;
  statusCode?: number;
  executionTime?: number;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SystemLogCreationAttributes = Optional<SystemLogAttributes, 'id' | 'details' | 'ipAddress' | 'userAgent' | 'userId' | 'type' | 'category' | 'status' | 'username' | 'action' | 'method' | 'requestMethod' | 'requestUrl' | 'path' | 'responseStatus' | 'statusCode' | 'executionTime' | 'duration' >;

export class SystemLog extends Model<SystemLogAttributes, SystemLogCreationAttributes> implements SystemLogAttributes {
  public id!: number;
  public level!: LogLevel;
  public operationType!: OperationType;
  public moduleName!: string;
  public message!: string;
  public details!: any;
  public ipAddress!: string | null;
  public userAgent!: string | null;
  public userId!: number | null;
  public type?: SystemLogType;
  public category?: LogCategory;
  public status?: SystemLogStatus;
  public username?: string;
  public action?: string;
  public method?: string;
  public requestMethod?: string;
  public requestUrl?: string;
  public path?: string;
  public responseStatus?: number;
  public statusCode?: number;
  public executionTime?: number;
  public duration?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;

  static initModel(sequelize: Sequelize): void {
    SystemLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        level: {
          type: DataTypes.ENUM(...Object.values(LogLevel)),
          allowNull: false,
          defaultValue: LogLevel.INFO,
          comment: '日志级别',
        },
        operationType: {
          type: DataTypes.ENUM(...Object.values(OperationType)),
          allowNull: false,
          field: 'operation_type',
          comment: '操作类型',
        },
        moduleName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: 'module_name',
          comment: '模块名称',
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: '日志消息',
        },
        details: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '详细信息（JSON格式）',
        },
        ipAddress: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: 'ip_address',
          comment: 'IP地址',
        },
        userAgent: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'user_agent',
          comment: '用户代理信息',
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'user_id',
          comment: '用户ID',
        },
        type: {
          type: DataTypes.ENUM(...Object.values(SystemLogType)),
          allowNull: true,
          comment: '日志类型',
        },
        category: {
          type: DataTypes.ENUM(...Object.values(LogCategory)),
          allowNull: true,
          comment: '日志分类',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(SystemLogStatus)),
          allowNull: true,
          comment: '日志状态',
        },
        username: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '用户名',
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '操作动作',
        },
        method: {
          type: DataTypes.STRING(20),
          allowNull: true,
          comment: '请求方法',
        },
        requestMethod: {
          type: DataTypes.STRING(20),
          allowNull: true,
          field: 'request_method',
          comment: '请求方法',
        },
        requestUrl: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'request_url',
          comment: '请求URL',
        },
        path: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '请求路径',
        },
        responseStatus: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'response_status',
          comment: '响应状态码',
        },
        statusCode: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'status_code',
          comment: '状态码',
        },
        executionTime: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'execution_time',
          comment: '执行时间（毫秒）',
        },
        duration: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '持续时间（毫秒）',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
          comment: '创建时间'
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at',
          comment: '更新时间'
        },
      },
      {
        sequelize,
        tableName: 'system_logs',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    SystemLog.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
}

export default SystemLog;
