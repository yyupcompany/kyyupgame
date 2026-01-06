import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

/**
 * 任务评论属性接口
 */
export interface TaskCommentAttributes {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  createdAt?: Date;
}

/**
 * 任务评论创建属性接口
 */
export interface TaskCommentCreationAttributes extends Optional<TaskCommentAttributes, 'id' | 'createdAt'> {}

/**
 * 任务评论模型
 */
export class TaskComment extends Model<TaskCommentAttributes, TaskCommentCreationAttributes> implements TaskCommentAttributes {
  public id!: number;
  public taskId!: number;
  public userId!: number;
  public content!: string;
  public createdAt!: Date;

  // 关联
  public user?: any;
  public task?: any;

  /**
   * 初始化模型
   */
  public static initModel(sequelize: Sequelize): typeof TaskComment {
    TaskComment.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          comment: '评论ID'
        },
        taskId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'task_id',
          comment: '任务ID'
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'user_id',
          comment: '评论人ID'
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: '评论内容'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
          comment: '创建时间'
        }
      },
      {
        sequelize,
        tableName: 'task_comments',
        timestamps: false,
        underscored: true,
        comment: '任务评论表'
      }
    );

    return TaskComment;
  }
}

export default TaskComment;

