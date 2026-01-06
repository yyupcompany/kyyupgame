import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 任务优先级枚举
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 检查任务属性接口
export interface InspectionTaskAttributes {
  id: number;
  inspectionPlanId: number;
  parentTaskId?: number;
  title: string;
  description?: string;
  assignedTo?: number;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  sortOrder: number;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选属性
interface InspectionTaskCreationAttributes extends Optional<InspectionTaskAttributes, 'id' | 'priority' | 'status' | 'progress' | 'sortOrder'> {}

// 检查任务模型
class InspectionTask extends Model<InspectionTaskAttributes, InspectionTaskCreationAttributes> 
  implements InspectionTaskAttributes {
  public id!: number;
  public inspectionPlanId!: number;
  public parentTaskId?: number;
  public title!: string;
  public description?: string;
  public assignedTo?: number;
  public priority!: TaskPriority;
  public status!: TaskStatus;
  public progress!: number;
  public startDate?: Date;
  public dueDate?: Date;
  public completedDate?: Date;
  public sortOrder!: number;
  public createdBy?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联
  public readonly inspectionPlan?: any;
  public readonly parentTask?: any;
  public readonly assignedUser?: any;
  public readonly subtasks?: InspectionTask[];
  public readonly attachments?: any[];
  public readonly comments?: any[];

  // 初始化模型
  static initModel(sequelize: Sequelize): void {
    InspectionTask.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        inspectionPlanId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'inspection_plan_id',
          comment: '检查计划ID',
        },
        parentTaskId: {
          type: DataTypes.INTEGER,
          field: 'parent_task_id',
          comment: '父任务ID(支持树状结构)',
        },
        title: {
          type: DataTypes.STRING(200),
          allowNull: false,
          comment: '任务标题',
        },
        description: {
          type: DataTypes.TEXT,
          comment: '任务描述',
        },
        assignedTo: {
          type: DataTypes.INTEGER,
          field: 'assigned_to',
          comment: '分配给(用户ID)',
        },
        priority: {
          type: DataTypes.ENUM(...Object.values(TaskPriority)),
          defaultValue: TaskPriority.MEDIUM,
          comment: '优先级',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(TaskStatus)),
          defaultValue: TaskStatus.PENDING,
          comment: '状态',
        },
        progress: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          comment: '进度(0-100)',
          validate: {
            min: 0,
            max: 100,
          },
        },
        startDate: {
          type: DataTypes.DATEONLY,
          field: 'start_date',
          comment: '开始日期',
        },
        dueDate: {
          type: DataTypes.DATEONLY,
          field: 'due_date',
          comment: '截止日期',
        },
        completedDate: {
          type: DataTypes.DATEONLY,
          field: 'completed_date',
          comment: '完成日期',
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          field: 'sort_order',
          defaultValue: 0,
          comment: '排序',
        },
        createdBy: {
          type: DataTypes.INTEGER,
          field: 'created_by',
          comment: '创建人ID',
        },
      },
      {
        sequelize,
        tableName: 'inspection_tasks',
        underscored: true,
        timestamps: true,
        indexes: [
          { fields: ['inspection_plan_id'] },
          { fields: ['parent_task_id'] },
          { fields: ['assigned_to'] },
          { fields: ['status'] },
          { fields: ['due_date'] },
        ],
      }
    );
  }
}

export default InspectionTask;

