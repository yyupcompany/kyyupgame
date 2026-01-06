import { DataTypes, QueryInterface } from 'sequelize';
import { sequelize } from '../init';

/**
 * 创建招生任务表
 * 用于存储招生任务分配信息
 */
export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('enrollment_tasks', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '招生任务ID - 主键'
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'plan_id',
      comment: '招生计划ID - 外键关联招生计划表',
      references: {
        model: 'enrollment_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'teacher_id',
      comment: '教师ID - 外键关联教师表',
      references: {
        model: 'teachers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '任务标题'
    },
    taskType: {
      type: DataTypes.TINYINT,
      allowNull: false,
      field: 'task_type',
      comment: '任务类型 - 1:咨询转化 2:活动执行 3:家长回访 4:信息收集 5:其他'
    },
    targetCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'target_count',
      comment: '目标人数'
    },
    actualCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'actual_count',
      comment: '实际完成人数'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
      comment: '开始日期'
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'end_date',
      comment: '结束日期'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '任务描述'
    },
    requirement: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '任务要求'
    },
    priority: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 2,
      comment: '优先级 - 1:低 2:中 3:高'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '状态 - 0:未开始 1:进行中 2:已完成 3:已取消'
    },
    remark: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '备注信息'
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'creator_id',
      comment: '创建人ID'
    },
    updaterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'updater_id',
      comment: '更新人ID'
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
      comment: '删除时间（软删除）'
    }
  });

  // 创建计划ID索引
  await queryInterface.addIndex('enrollment_tasks', ['plan_id'], {
    name: 'idx_plan_id'
  });

  // 创建教师ID索引
  await queryInterface.addIndex('enrollment_tasks', ['teacher_id'], {
    name: 'idx_teacher_id'
  });

  // 创建状态索引
  await queryInterface.addIndex('enrollment_tasks', ['status'], {
    name: 'idx_status'
  });
}

/**
 * 删除招生任务表
 */
export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('enrollment_tasks');
} 