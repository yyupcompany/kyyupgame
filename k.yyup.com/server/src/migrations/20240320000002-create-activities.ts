import { DataTypes, QueryInterface } from 'sequelize';
import { sequelize } from '../init';

/**
 * 创建活动表
 * 用于存储招生相关活动信息
 */
export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('activities', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '活动ID - 主键'
    },
    kindergartenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'kindergarten_id',
      comment: '幼儿园ID - 外键关联幼儿园表',
      references: {
        model: 'kindergartens',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'plan_id',
      comment: '招生计划ID - 外键关联招生计划表',
      references: {
        model: 'enrollment_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '活动标题'
    },
    activityType: {
      type: DataTypes.TINYINT,
      allowNull: false,
      field: 'activity_type',
      comment: '活动类型 - 1:开放日 2:体验课 3:亲子活动 4:招生说明会 5:家长会 6:节日活动 7:其他'
    },
    coverImage: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'cover_image',
      comment: '封面图片URL'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time',
      comment: '活动开始时间'
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_time',
      comment: '活动结束时间'
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '活动地点'
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '活动容量'
    },
    registeredCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'registered_count',
      comment: '已报名人数'
    },
    checkedInCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'checked_in_count',
      comment: '已签到人数'
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '活动费用'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '活动描述'
    },
    agenda: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '活动议程'
    },
    registrationStartTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'registration_start_time',
      comment: '报名开始时间'
    },
    registrationEndTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'registration_end_time',
      comment: '报名结束时间'
    },
    needsApproval: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: 'needs_approval',
      comment: '是否需要审核 - 0:否 1:是'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '状态 - 0:草稿 1:未开始 2:报名中 3:进行中 4:已结束 5:已取消'
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

  // 创建幼儿园ID索引
  await queryInterface.addIndex('activities', ['kindergarten_id'], {
    name: 'idx_kindergarten_id'
  });

  // 创建计划ID索引
  await queryInterface.addIndex('activities', ['plan_id'], {
    name: 'idx_plan_id'
  });

  // 创建活动类型索引
  await queryInterface.addIndex('activities', ['activity_type'], {
    name: 'idx_activity_type'
  });

  // 创建状态索引
  await queryInterface.addIndex('activities', ['status'], {
    name: 'idx_status'
  });
}

/**
 * 删除活动表
 */
export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('activities');
} 