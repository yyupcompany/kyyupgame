import { DataTypes, Model, Optional, Sequelize } from 'sequelize'
import { User } from './user.model'
// import { TeacherReferral } from './teacher-referral.model' // 暂时禁用

export enum TeacherRewardType {
  CASH = 'cash',
  VOUCHER = 'voucher',
  GIFT = 'gift',
  POINTS = 'points'
}

export enum TeacherRewardStatus {
  AVAILABLE = 'available',
  USED = 'used',
  EXPIRED = 'expired'
}

export interface TeacherRewardAttributes {
  id: number
  teacherId: number
  title: string
  description: string
  type: TeacherRewardType
  value?: number
  currency?: string
  status: TeacherRewardStatus
  expiryDate?: Date
  createdAt: Date
  updatedAt?: Date
  usedAt?: Date
  source: string
  usageInstructions?: string
  usedBy?: number
  usageLocation?: string
  usageNotes?: string
  referralId?: number
}

export interface TeacherRewardCreationAttributes extends Optional<TeacherRewardAttributes, 'id' | 'createdAt' | 'updatedAt' | 'usedAt' | 'usedBy' | 'usageLocation' | 'usageNotes'> {}

export class TeacherReward extends Model<TeacherRewardAttributes, TeacherRewardCreationAttributes> implements TeacherRewardAttributes {
  public id!: number
  public teacherId!: number
  public title!: string
  public description!: string
  public type!: TeacherRewardType
  public value?: number
  public currency?: string
  public status!: TeacherRewardStatus
  public expiryDate?: Date
  public createdAt!: Date
  public updatedAt?: Date
  public usedAt?: Date
  public source!: string
  public usageInstructions?: string
  public usedBy?: number
  public usageLocation?: string
  public usageNotes?: string
  public referralId?: number

  // 关联关系
  public teacher?: User
  // public referral?: TeacherReferral // 暂时禁用

  /**
   * 检查奖励是否已过期
   */
  public isExpired(): boolean {
    if (!this.expiryDate) return false
    return new Date() > this.expiryDate
  }

  /**
   * 检查奖励是否可用
   */
  public isAvailable(): boolean {
    return this.status === TeacherRewardStatus.AVAILABLE && !this.isExpired()
  }

  /**
   * 使用奖励
   */
  public async use(usageData: {
    usedBy: number
    usageLocation: string
    usageNotes?: string
  }): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('奖励不可用')
    }

    await this.update({
      status: TeacherRewardStatus.USED,
      usedAt: new Date(),
      usedBy: usageData.usedBy,
      usageLocation: usageData.usageLocation,
      usageNotes: usageData.usageNotes
    })
  }

  /**
   * 格式化奖励价值显示
   */
  public formatValue(): string {
    if (!this.value) return ''

    switch (this.type) {
      case TeacherRewardType.CASH:
      case TeacherRewardType.VOUCHER:
        return `¥${this.value}`
      case TeacherRewardType.POINTS:
        return `${this.value} 积分`
      default:
        return this.value.toString()
    }
  }

  /**
   * 获取状态文本
   */
  public getStatusText(): string {
    const statusMap = {
      [TeacherRewardStatus.AVAILABLE]: '可用',
      [TeacherRewardStatus.USED]: '已使用',
      [TeacherRewardStatus.EXPIRED]: '已过期'
    }
    return statusMap[this.status] || this.status
  }

  /**
   * 获取类型文本
   */
  public getTypeText(): string {
    const typeMap = {
      [TeacherRewardType.CASH]: '现金',
      [TeacherRewardType.VOUCHER]: '代金券',
      [TeacherRewardType.GIFT]: '礼品',
      [TeacherRewardType.POINTS]: '积分'
    }
    return typeMap[this.type] || this.type
  }
}

export const initTeacherRewardModel = (sequelize: Sequelize) => {
  TeacherReward.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: '教师ID'
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '奖励标题'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '奖励描述'
      },
      type: {
        type: DataTypes.ENUM(...Object.values(TeacherRewardType)),
        allowNull: false,
        comment: '奖励类型'
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '奖励价值'
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'CNY',
        comment: '货币类型'
      },
      status: {
        type: DataTypes.ENUM(...Object.values(TeacherRewardStatus)),
        allowNull: false,
        defaultValue: TeacherRewardStatus.AVAILABLE,
        comment: '奖励状态'
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '过期时间'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '使用时间'
      },
      source: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '奖励来源'
      },
      usageInstructions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '使用说明'
      },
      usedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '使用人ID'
      },
      usageLocation: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '使用位置'
      },
      usageNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '使用备注'
      },
      referralId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '关联的转介绍记录ID'
      }
    },
    {
      sequelize,
      tableName: 'teacher_rewards',
      modelName: 'TeacherReward',
      timestamps: true,
      underscored: true,
      comment: '教师奖励表',
      indexes: [
        {
          fields: ['teacher_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['type']
        },
        {
          fields: ['expiry_date']
        },
        {
          fields: ['referral_id']
        },
        {
          fields: ['teacher_id', 'status']
        },
        {
          fields: ['created_at']
        }
      ]
    }
  )
}