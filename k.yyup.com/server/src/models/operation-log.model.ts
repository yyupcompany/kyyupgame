import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { User } from './user.model';

/**
 * 操作类型
 */
export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  OTHER = 'other',
}

/**
 * 操作结果
 */
export enum OperationResult {
  SUCCESS = 'success',
  FAILED = 'failed',
}


export class OperationLog extends Model<
  InferAttributes<OperationLog>,
  InferCreationAttributes<OperationLog>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']> | null;
  declare module: string;
  declare action: string;
  declare operationType: OperationType;
  declare resourceType: string | null;
  declare resourceId: string | null;
  declare description: string | null;
  declare requestMethod: string | null;
  declare requestUrl: string | null;
  declare requestParams: string | null;
  declare requestIp: string | null;
  declare userAgent: string | null;
  declare deviceInfo: string | null;
  declare operationResult: OperationResult | null;
  declare resultMessage: string | null;
  declare executionTime: number | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  public readonly user?: User;
}

export const initOperationLog = (sequelize: Sequelize) => {
  OperationLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '日志ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '操作用户ID',
      },
      module: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '操作模块',
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '操作行为',
      },
      operationType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '操作类型: create, read, update, delete, login, logout, other',
      },
      resourceType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '资源类型',
      },
      resourceId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '资源ID',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '操作描述',
      },
      requestMethod: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: '请求方法: GET, POST, PUT, DELETE等',
      },
      requestUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '请求URL',
      },
      requestParams: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '请求参数',
      },
      requestIp: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '请求IP',
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '用户代理',
      },
      deviceInfo: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '设备信息',
      },
      operationResult: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: '操作结果: success, failed',
      },
      resultMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '结果信息',
      },
      executionTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '执行时间(ms)',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '更新时间',
      },
    },
    {
      sequelize,
      tableName: 'operation_logs',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return OperationLog;
};

export const initOperationLogAssociations = () => {
  OperationLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });
};
