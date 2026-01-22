import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface AlertRuleAttributes {
  id: number;
  name: string;
  description: string;
  alertType: string;
  alertLevel: string;
  conditionType: string; // 'threshold' | 'schedule' | 'event' | 'expression'
  conditionConfig: Record<string, any>; // 条件配置
  actionType: string; // 'notify' | 'escalate' | 'auto_resolve'
  actionConfig: Record<string, any>; // 动作配置
  enabled: boolean;
  scopeType: string; // 'global' | 'class' | 'student' | 'parent'
  scopeId: string | null;
  cooldownMinutes: number; // 冷却时间(分钟)
  lastTriggeredAt: Date | null;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type AlertRuleCreationAttributes = Optional<
  AlertRuleAttributes,
  | 'id'
  | 'lastTriggeredAt'
  | 'triggerCount'
  | 'deletedAt'
>;

export class AlertRule
  extends Model<AlertRuleAttributes, AlertRuleCreationAttributes>
  implements AlertRuleAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public alertType!: string;
  public alertLevel!: string;
  public conditionType!: string;
  public conditionConfig!: Record<string, any>;
  public actionType!: string;
  public actionConfig!: Record<string, any>;
  public enabled!: boolean;
  public scopeType!: string;
  public scopeId!: string | null;
  public cooldownMinutes!: number;
  public lastTriggeredAt!: Date | null;
  public triggerCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  /**
   * 检查是否在冷却期
   */
  public isInCooldown(): boolean {
    if (!this.lastTriggeredAt) return false;
    const cooldownEnd = new Date(this.lastTriggeredAt);
    cooldownEnd.setMinutes(cooldownEnd.getMinutes() + this.cooldownMinutes);
    return new Date() < cooldownEnd;
  }

  /**
   * 检查规则是否应该触发
   */
  public shouldTrigger(data: Record<string, any>): boolean {
    if (!this.enabled) return false;
    if (this.isInCooldown()) return false;

    const { conditionType, conditionConfig } = this;

    switch (conditionType) {
      case 'threshold':
        return this.checkThresholdCondition(data, conditionConfig);
      case 'schedule':
        return this.checkScheduleCondition(conditionConfig);
      case 'event':
        return this.checkEventCondition(data, conditionConfig);
      case 'expression':
        return this.checkExpressionCondition(data, conditionConfig);
      default:
        return false;
    }
  }

  private checkThresholdCondition(
    data: Record<string, any>,
    config: Record<string, any>
  ): boolean {
    const field = config.field;
    const operator = config.operator; // 'gt', 'lt', 'eq', 'gte', 'lte'
    const value = config.value;

    const fieldValue = this.getNestedValue(data, field);
    if (fieldValue === undefined) return false;

    switch (operator) {
      case 'gt':
        return fieldValue > value;
      case 'lt':
        return fieldValue < value;
      case 'eq':
        return fieldValue === value;
      case 'gte':
        return fieldValue >= value;
      case 'lte':
        return fieldValue <= value;
      default:
        return false;
    }
  }

  private checkScheduleCondition(config: Record<string, any>): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const dayOfWeek = now.getDay();

    // 检查时间窗口
    if (config.startTime && config.endTime) {
      const [startHour, startMin] = config.startTime.split(':').map(Number);
      const [endHour, endMin] = config.endTime.split(':').map(Number);
      const currentMinutes = hour * 60 + minute;
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
        return false;
      }
    }

    // 检查星期
    if (config.daysOfWeek && config.daysOfWeek.length > 0) {
      if (!config.daysOfWeek.includes(dayOfWeek)) {
        return false;
      }
    }

    return true;
  }

  private checkEventCondition(
    data: Record<string, any>,
    config: Record<string, any>
  ): boolean {
    const eventType = config.eventType;
    return data.eventType === eventType;
  }

  private checkExpressionCondition(
    data: Record<string, any>,
    config: Record<string, any>
  ): boolean {
    // 简单的表达式解析
    const expression = config.expression;
    try {
      // 替换变量
      let evalExpression = expression;
      for (const [key, value] of Object.entries(data)) {
        evalExpression = evalExpression.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value));
      }
      // 注意：生产环境中应该使用安全的表达式解析器
      return new Function('return ' + evalExpression)();
    } catch {
      return false;
    }
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

const defineAttributes = (sequelize: Sequelize) => {
  AlertRule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '规则ID - 主键'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '规则名称'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '规则描述'
      },
      alertType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'alert_type',
        comment: '告警类型'
      },
      alertLevel: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'alert_level',
        comment: '告警级别'
      },
      conditionType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'condition_type',
        comment: '条件类型 - threshold, schedule, event, expression'
      },
      conditionConfig: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        field: 'condition_config',
        comment: '条件配置'
      },
      actionType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'action_type',
        comment: '动作类型 - notify, escalate, auto_resolve'
      },
      actionConfig: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        field: 'action_config',
        comment: '动作配置'
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否启用'
      },
      scopeType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'global',
        field: 'scope_type',
        comment: '作用范围 - global, class, student, parent'
      },
      scopeId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'scope_id',
        comment: '作用范围ID'
      },
      cooldownMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
        field: 'cooldown_minutes',
        comment: '冷却时间(分钟)'
      },
      lastTriggeredAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_triggered_at',
        comment: '上次触发时间'
      },
      triggerCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'trigger_count',
        comment: '触发次数'
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
      tableName: 'alert_rules',
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          fields: ['alert_type']
        },
        {
          fields: ['enabled']
        }
      ]
    }
  );
};

// 导出初始化函数
export const initAlertRule = (sequelize: Sequelize): void => {
  defineAttributes(sequelize);
};

export default AlertRule;
