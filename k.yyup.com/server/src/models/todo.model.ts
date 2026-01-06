import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';

export enum TodoPriority {
  HIGHEST = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
  LOWEST = 5,
}

export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export interface TodoAttributes {
  id: number; // 任务ID
  title: string; // 任务标题
  description: string | null; // 任务描述
  priority: TodoPriority; // 优先级 - 1:最高 2:高 3:中 4:低 5:最低
  status: TodoStatus; // 任务状态
  dueDate: Date | null; // 截止日期
  completedDate: Date | null; // 完成日期
  userId: number; // 创建用户ID
  assignedTo: number | null; // 分配给用户ID
  tags: string[] | null; // 标签列表
  relatedId: number | null; // 关联ID
  relatedType: string | null; // 关联类型
  notify: boolean; // 是否通知
  notifyTime: Date | null; // 通知时间
  createdAt?: Date; // 创建时间
  updatedAt?: Date; // 更新时间
  deletedAt?: Date | null; // 删除时间
}

export type TodoCreationAttributes = Optional<TodoAttributes, 'id' | 'description' | 'priority' | 'status' | 'dueDate' | 'completedDate' | 'assignedTo' | 'tags' | 'relatedId' | 'relatedType' | 'notify' | 'notifyTime' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class Todo extends Model<TodoAttributes, TodoCreationAttributes> implements TodoAttributes {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public priority!: TodoPriority;
  public status!: TodoStatus;
  public dueDate!: Date | null;
  public completedDate!: Date | null;
  public userId!: number;
  public assignedTo!: number | null;
  public tags!: string[] | null;
  public relatedId!: number | null;
  public relatedType!: string | null;
  public notify!: boolean;
  public notifyTime!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly user?: User;
  public readonly assignee?: User;

  // 核心修复：添加静态方法来清理数据中的undefined值
  static cleanUndefinedValues(data: any): any {
    const cleanedData: any = {};
    
    // 遍历所有属性，将undefined转换为null
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value === undefined) {
        console.warn(`⚠️ Todo模型清理undefined值: ${key} -> null`);
        cleanedData[key] = null;
      } else {
        cleanedData[key] = value;
      }
    });
    
    console.log('🔍 Todo模型数据清理完成:', Object.keys(cleanedData).length, '个字段');
    return cleanedData;
  }

  static initModel(sequelize: Sequelize): void {
    Todo.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '任务标题',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '任务描述',
        },
        priority: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: TodoPriority.MEDIUM,
          comment: '优先级 - 1:最高 2:高 3:中 4:低 5:最低',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(TodoStatus)),
          allowNull: false,
          defaultValue: TodoStatus.PENDING,
          comment: '任务状态',
        },
        dueDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'due_date',
          comment: '截止日期',
        },
        completedDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'completed_date',
          comment: '完成日期',
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'user_id',
          comment: '创建用户ID',
        },
        assignedTo: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'assigned_to',
          comment: '分配给用户ID',
        },
        tags: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '标签列表',
        },
        relatedId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'related_id',
          comment: '关联ID',
        },
        relatedType: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: 'related_type',
          comment: '关联类型',
        },
        notify: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: '是否通知',
        },
        notifyTime: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'notify_time',
          comment: '通知时间',
        },
      },
      {
        sequelize,
        tableName: 'todos',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    Todo.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Todo.belongsTo(User, {
      foreignKey: 'assignedTo',
      as: 'assignee'
    });
  }
}

export default Todo;
