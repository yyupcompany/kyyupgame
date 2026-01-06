import { DataTypes, QueryInterface } from 'sequelize';
import { sequelize } from '../init';

/**
 * 创建招生计划表
 * 用于存储幼儿园招生计划基本信息
 */
export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('enrollment_plans', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '招生计划ID - 主键'
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
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '招生计划标题'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '招生年份'
    },
    semester: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '学期 - 1:春季 2:秋季'
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
    targetCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'target_count',
      comment: '招生目标人数'
    },
    targetAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'target_amount',
      comment: '招生目标金额'
    },
    ageRange: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'age_range',
      comment: '招生年龄范围'
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '招生要求'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '招生计划描述'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '状态 - 0:草稿 1:进行中 2:已完成 3:已取消'
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'approved_by',
      comment: '审批人ID'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at',
      comment: '审批时间'
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

  // 创建幼儿园ID索引 - 注释掉此行，因为外键可能已自动创建索引，或者避免重复键名错误
  // await queryInterface.addIndex('enrollment_plans', ['kindergarten_id'], {
  //   name: 'idx_kindergarten_id'
  // });

  // 创建年份和学期的联合索引 - 注释掉此行以避免重复键名错误
  // await queryInterface.addIndex('enrollment_plans', ['kindergarten_id', 'year', 'semester'], {
  //   name: 'idx_kindergarten_year_semester'
  // });

  // 创建状态索引 - 注释掉此行以避免重复键名错误
  // await queryInterface.addIndex('enrollment_plans', ['status'], {
  //   name: 'idx_status'
  // });
}

/**
 * 删除招生计划表
 */
export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('enrollment_plans');
} 