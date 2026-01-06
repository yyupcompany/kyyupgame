/**
 * 跟进记录数据模型
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';
import { User } from './user.model';
import { Student } from './student.model';

// 跟进记录接口定义
interface FollowUpAttributes {
  id: number;
  title: string;
  content: string;
  type: 'student' | 'parent' | 'teacher' | 'general';
  targetId?: number;
  followUpDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  assigneeId: number;
  createdById: number;
  updatedById?: number;
  completedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FollowUpCreationAttributes extends Optional<FollowUpAttributes, 'id' | 'targetId' | 'updatedById' | 'completedAt' | 'notes' | 'createdAt' | 'updatedAt'> {}

// 跟进记录模型类
export class FollowUp extends Model<FollowUpAttributes, FollowUpCreationAttributes> implements FollowUpAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public type!: 'student' | 'parent' | 'teacher' | 'general';
  public targetId?: number;
  public followUpDate!: Date;
  public status!: 'pending' | 'completed' | 'cancelled';
  public priority!: 'high' | 'medium' | 'low';
  public assigneeId!: number;
  public createdById!: number;
  public updatedById?: number;
  public completedAt?: Date;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
FollowUp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '跟进记录ID'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '跟进标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '跟进内容'
    },
    type: {
      type: DataTypes.ENUM('student', 'parent', 'teacher', 'general'),
      allowNull: false,
      defaultValue: 'general',
      comment: '跟进类型'
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '目标对象ID (学生/家长/教师ID)'
    },
    followUpDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '跟进日期'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      comment: '跟进状态'
    },
    priority: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      allowNull: false,
      defaultValue: 'medium',
      comment: '优先级'
    },
    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分配给的负责人ID'
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '创建者ID'
    },
    updatedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '更新者ID'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成时间'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注信息'
    }
  },
  {
    sequelize,
    tableName: 'followups',
    modelName: 'FollowUp',
    timestamps: true,
    indexes: [
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['assigneeId']
      },
      {
        fields: ['createdById']
      },
      {
        fields: ['followUpDate']
      }
    ]
  }
);

// 定义关联关系
export function setupFollowUpAssociations() {
  FollowUp.belongsTo(User, {
    foreignKey: 'assigneeId',
    as: 'assignee'
  });

  FollowUp.belongsTo(User, {
    foreignKey: 'createdById',
    as: 'creator'
  });

  FollowUp.belongsTo(User, {
    foreignKey: 'updatedById',
    as: 'updater'
  });

  FollowUp.belongsTo(Student, {
    foreignKey: 'targetId',
    as: 'student',
    constraints: false // 因为targetId可能指向其他表
  });
}

export default FollowUp;