import { DataTypes, QueryInterface } from 'sequelize';
import { sequelize } from '../init';

/**
 * 创建家长表
 * 用于存储家长基本信息
 */
export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('parents', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '家长ID - 主键'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      comment: '用户ID - 外键关联用户表',
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
      comment: '学生ID - 外键关联学生表',
      references: {
        model: 'students',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    relationship: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '与学生关系 - 如：父亲、母亲、爷爷、奶奶等'
    },
    isPrimaryContact: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: 'is_primary_contact',
      comment: '是否主要联系人 - 0:否 1:是'
    },
    isLegalGuardian: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: 'is_legal_guardian',
      comment: '是否法定监护人 - 0:否 1:是'
    },
    idCardNo: {
      type: DataTypes.STRING(18),
      allowNull: true,
      field: 'id_card_no',
      comment: '身份证号'
    },
    workUnit: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'work_unit',
      comment: '工作单位'
    },
    occupation: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '职业'
    },
    education: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '学历'
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '居住地址'
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

  // 创建用户ID索引
  await queryInterface.addIndex('parents', ['user_id'], {
    name: 'idx_user_id'
  });

  // 创建学生ID索引
  await queryInterface.addIndex('parents', ['student_id'], {
    name: 'idx_student_id'
  });

  // 创建用户-学生唯一索引
  await queryInterface.addIndex('parents', ['user_id', 'student_id'], {
    unique: true,
    name: 'uk_user_student'
  });
}

/**
 * 删除家长表
 */
export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('parents');
} 