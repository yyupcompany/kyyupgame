import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';

export interface AlertAttributes {
  id: number;
  alertType: string; // 'attendance' | 'payment' | 'health' | 'safety' | 'enrollment' | 'custom'
  alertLevel: string; // 'low' | 'medium' | 'high' | 'critical'
  title: string;
  description: string;
  sourceType: string; // 'system' | 'manual' | 'scheduled'
  sourceId: string | null; // 相关业务ID
  status: string; // 'active' | 'acknowledged' | 'resolved' | 'dismissed'
  priority: number;
  triggeredAt: Date;
  acknowledgedAt: Date | null;
  acknowledgedBy: number | null;
  resolvedAt: Date | null;
  resolvedBy: number | null;
  resolution: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type AlertCreationAttributes = Optional<
  AlertAttributes,
  | 'id'
  | 'acknowledgedAt'
  | 'acknowledgedBy'
  | 'resolvedAt'
  | 'resolvedBy'
  | 'resolution'
  | 'deletedAt'
>;

export class Alert
  extends Model<AlertAttributes, AlertCreationAttributes>
  implements AlertAttributes
{
  public id!: number;
  public alertType!: string;
  public alertLevel!: string;
  public title!: string;
  public description!: string;
  public sourceType!: string;
  public sourceId!: string | null;
  public status!: string;
  public priority!: number;
  public triggeredAt!: Date;
  public acknowledgedAt!: Date | null;
  public acknowledgedBy!: number | null;
  public resolvedAt!: Date | null;
  public resolvedBy!: number | null;
  public resolution!: string | null;
  public metadata!: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // Associations
  public readonly acknowledger?: User;
  public readonly resolver?: User;

  /**
   * 获取告警严重程度颜色
   */
  public getLevelColor(): string {
    const colorMap: Record<string, string> = {
      low: '#909399',
      medium: '#E6A23C',
      high: '#F56C6C',
      critical: '#C21F3A'
    };
    return colorMap[this.alertLevel] || '#909399';
  }

  /**
   * 检查是否已过期
   */
  public isExpired(hours: number = 24): boolean {
    const expirationTime = new Date(this.triggeredAt);
    expirationTime.setHours(expirationTime.getHours() + hours);
    return new Date() > expirationTime;
  }

  /**
   * 获取告警状态标签
   */
  public getStatusLabel(): string {
    const statusMap: Record<string, string> = {
      active: '待处理',
      acknowledged: '已确认',
      resolved: '已解决',
      dismissed: '已忽略'
    };
    return statusMap[this.status] || this.status;
  }

  /**
   * 获取告警类型图标
   */
  public getTypeIcon(): string {
    const iconMap: Record<string, string> = {
      attendance: 'Clock',
      payment: 'Money',
      health: 'FirstAidKit',
      safety: 'Lock',
      enrollment: 'User',
      custom: 'Bell'
    };
    return iconMap[this.alertType] || 'Bell';
  }
}

const defineAttributes = (sequelize: Sequelize) => {
  Alert.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '告警ID - 主键'
      },
      alertType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'alert_type',
        comment: '告警类型 - 考勤、支付、健康、安全、招生等'
      },
      alertLevel: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'alert_level',
        comment: '告警级别 - low, medium, high, critical'
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '告警标题'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '告警详情描述'
      },
      sourceType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'source_type',
        defaultValue: 'system',
        comment: '告警来源 - system, manual, scheduled'
      },
      sourceId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'source_id',
        comment: '关联业务ID'
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        comment: '告警状态 - active, acknowledged, resolved, dismissed'
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '优先级排序 (数字越大优先级越高)'
      },
      triggeredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'triggered_at',
        comment: '触发时间'
      },
      acknowledgedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'acknowledged_at',
        comment: '确认时间'
      },
      acknowledgedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'acknowledged_by',
        comment: '确认人ID',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'resolved_at',
        comment: '解决时间'
      },
      resolvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'resolved_by',
        comment: '解决人ID',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      resolution: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '解决方案'
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: '扩展元数据'
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
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
        comment: '删除时间'
      }
    },
    {
      sequelize,
      tableName: 'alerts',
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          fields: ['alert_type']
        },
        {
          fields: ['alert_level']
        },
        {
          fields: ['status']
        },
        {
          fields: ['triggered_at']
        },
        {
          fields: ['priority']
        }
      ]
    }
  );
};

const defineAssociations = () => {
  Alert.belongsTo(User, {
    foreignKey: 'acknowledgedBy',
    as: 'acknowledger'
  });
  Alert.belongsTo(User, {
    foreignKey: 'resolvedBy',
    as: 'resolver'
  });
};

// 导出初始化函数
export const initAlert = (sequelize: Sequelize): void => {
  defineAttributes(sequelize);
};

export const initAlertAssociations = (): void => {
  defineAssociations();
};

export default Alert;
