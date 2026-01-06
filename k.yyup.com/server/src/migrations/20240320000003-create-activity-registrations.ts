import { DataTypes, QueryInterface } from 'sequelize';
import { sequelize } from '../init';

/**
 * 创建活动报名表
 * 用于存储活动报名和签到信息
 */
export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('activity_registrations', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '报名ID - 主键'
    },
    activityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'activity_id',
      comment: '活动ID - 外键关联活动表',
      references: {
        model: 'activities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id',
      comment: '家长ID - 外键关联家长表',
      references: {
        model: 'parents',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'student_id',
      comment: '学生ID - 外键关联学生表',
      references: {
        model: 'students',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    contactName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'contact_name',
      comment: '联系人姓名'
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'contact_phone',
      comment: '联系人电话'
    },
    childName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'child_name',
      comment: '孩子姓名'
    },
    childAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'child_age',
      comment: '孩子年龄'
    },
    childGender: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'child_gender',
      comment: '孩子性别 - 0:未知 1:男 2:女'
    },
    registrationTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'registration_time',
      comment: '报名时间'
    },
    attendeeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'attendee_count',
      comment: '参加人数'
    },
    specialNeeds: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'special_needs',
      comment: '特殊需求'
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '来源渠道'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '状态 - 0:待审核 1:已确认 2:已拒绝 3:已取消 4:已签到 5:未出席'
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'check_in_time',
      comment: '签到时间'
    },
    checkInLocation: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'check_in_location',
      comment: '签到地点'
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '参与反馈'
    },
    isConversion: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: 'is_conversion',
      comment: '是否转化 - 0:未转化 1:已转化'
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

  // 创建活动ID索引
  await queryInterface.addIndex('activity_registrations', ['activity_id'], {
    name: 'idx_activity_id'
  });

  // 创建家长ID索引
  await queryInterface.addIndex('activity_registrations', ['parent_id'], {
    name: 'idx_parent_id'
  });

  // 创建学生ID索引
  await queryInterface.addIndex('activity_registrations', ['student_id'], {
    name: 'idx_student_id'
  });

  // 创建联系电话索引
  await queryInterface.addIndex('activity_registrations', ['contact_phone'], {
    name: 'idx_contact_phone'
  });

  // 创建状态索引
  await queryInterface.addIndex('activity_registrations', ['status'], {
    name: 'idx_status'
  });
}

/**
 * 删除活动报名表
 */
export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('activity_registrations');
} 