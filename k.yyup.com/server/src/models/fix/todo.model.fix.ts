import { DataTypes, Sequelize, Model } from 'sequelize';
import { BaseModelFix } from './base.model.fix';

export enum TodoPriority {
  LOW = 'LOW',         // 低
  MEDIUM = 'MEDIUM',   // 中
  HIGH = 'HIGH',       // 高
  URGENT = 'URGENT'    // 紧急
}

export enum TodoStatus {
  PENDING = 'PENDING',   // 待办
  COMPLETED = 'COMPLETED', // 已完成
  CANCELLED = 'CANCELLED'  // 已取消
}

export interface TodoAttributes {
  id: number;
  title: string;
  description: string | null;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate: Date | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export class TodoFix extends Model<TodoAttributes> {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public priority!: TodoPriority;
  public status!: TodoStatus;
  public dueDate!: Date | null;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public completedAt!: Date | null;

  /**
   * 初始化模型
   */
  static initializeModel(sequelize: Sequelize): typeof TodoFix {
    return TodoFix.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '待办事项标题',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '待办事项描述',
        },
        priority: {
          type: DataTypes.ENUM(...Object.values(TodoPriority)),
          allowNull: false,
          defaultValue: TodoPriority.MEDIUM,
          comment: '优先级',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(TodoStatus)),
          allowNull: false,
          defaultValue: TodoStatus.PENDING,
          comment: '状态',
        },
        dueDate: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '截止日期',
        },
        userId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          comment: '用户ID',
        },
        completedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '完成时间',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'todos',
        timestamps: true,
        indexes: [
          {
            name: 'todos_user_id_idx',
            fields: ['userId'],
          },
          {
            name: 'todos_status_idx',
            fields: ['status'],
          },
          {
            name: 'todos_due_date_idx',
            fields: ['dueDate'],
          },
        ],
      }
    );
  }
} 