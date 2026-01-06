/**
 * Task模型 - 通用任务模型
 * 这是Todo模型的别名，用于教师任务管理
 */

import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';

export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

export interface TaskAttributes {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: Date | null;
  creator_id: number;
  assignee_id: number | null;
  progress: number;
  type: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type TaskCreationAttributes = Optional<
  TaskAttributes,
  'id' | 'description' | 'priority' | 'status' | 'due_date' | 'assignee_id' | 'progress' | 'type' | 'created_at' | 'updated_at'
>;

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public priority!: TaskPriority;
  public status!: TaskStatus;
  public due_date!: Date | null;
  public creator_id!: number;
  public assignee_id!: number | null;
  public progress!: number;
  public type!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public readonly creator?: User;
  public readonly assignee?: User;

  static initModel(sequelize: Sequelize): void {
    Task.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(200),
          allowNull: false,
          comment: '任务标题',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '任务描述',
        },
        priority: {
          type: DataTypes.ENUM('high', 'medium', 'low'),
          allowNull: false,
          defaultValue: 'medium',
          comment: '优先级',
        },
        status: {
          type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue'),
          allowNull: false,
          defaultValue: 'pending',
          comment: '任务状态',
        },
        due_date: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '截止日期',
        },
        creator_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '创建人ID',
        },
        assignee_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '分配人ID',
        },
        progress: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '进度(0-100)',
        },
        type: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '任务类型',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updated_at',
        },
      },
      {
        sequelize,
        tableName: 'tasks',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }

  static associate(models: any): void {
    // Task -> User (creator)
    Task.belongsTo(models.User, {
      foreignKey: 'creator_id',
      as: 'creator',
    });

    // Task -> User (assignee)
    Task.belongsTo(models.User, {
      foreignKey: 'assignee_id',
      as: 'assignee',
    });
  }
}

export default Task;

