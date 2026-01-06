import { DataTypes, QueryInterface } from 'sequelize';
import { sequelize } from '../init';

/**
 * 创建活动评价表
 * 用于存储活动评价和反馈信息
 */
export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('activity_evaluations', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '评价ID - 主键'
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
    registrationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'registration_id',
      comment: '报名ID - 外键关联活动报名表',
      references: {
        model: 'activity_registrations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'teacher_id',
      comment: '教师ID - 外键关联教师表',
      references: {
        model: 'teachers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    evaluatorType: {
      type: DataTypes.TINYINT,
      allowNull: false,
      field: 'evaluator_type',
      comment: '评价人类型 - 1:家长 2:教师 3:管理员'
    },
    evaluatorName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'evaluator_name',
      comment: '评价人姓名'
    },
    evaluationTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'evaluation_time',
      comment: '评价时间'
    },
    overallRating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      field: 'overall_rating',
      comment: '总体评分 - 1-5分'
    },
    contentRating: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'content_rating',
      comment: '内容评分 - 1-5分'
    },
    organizationRating: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'organization_rating',
      comment: '组织评分 - 1-5分'
    },
    environmentRating: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'environment_rating',
      comment: '环境评分 - 1-5分'
    },
    serviceRating: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'service_rating',
      comment: '服务评分 - 1-5分'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '评价内容'
    },
    strengths: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '优点'
    },
    weaknesses: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '不足'
    },
    suggestions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '建议'
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '图片URLs，以逗号分隔'
    },
    isPublic: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      field: 'is_public',
      comment: '是否公开 - 0:私密 1:公开'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态 - 0:待审核 1:已发布 2:已拒绝'
    },
    replyContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'reply_content',
      comment: '回复内容'
    },
    replyTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reply_time',
      comment: '回复时间'
    },
    replyUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'reply_user_id',
      comment: '回复人ID'
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
  await queryInterface.addIndex('activity_evaluations', ['activity_id'], {
    name: 'idx_activity_id'
  });

  // 创建报名ID索引
  await queryInterface.addIndex('activity_evaluations', ['registration_id'], {
    name: 'idx_registration_id'
  });

  // 创建家长ID索引
  await queryInterface.addIndex('activity_evaluations', ['parent_id'], {
    name: 'idx_parent_id'
  });

  // 创建教师ID索引
  await queryInterface.addIndex('activity_evaluations', ['teacher_id'], {
    name: 'idx_teacher_id'
  });

  // 创建评分索引
  await queryInterface.addIndex('activity_evaluations', ['overall_rating'], {
    name: 'idx_overall_rating'
  });

  // 创建状态索引
  await queryInterface.addIndex('activity_evaluations', ['status'], {
    name: 'idx_status'
  });
}

/**
 * 删除活动评价表
 */
export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('activity_evaluations');
} 