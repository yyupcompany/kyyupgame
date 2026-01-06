import { DataTypes, QueryInterface } from 'sequelize';
import { sequelize } from '../init';

/**
 * 创建学生表
 * 用于存储学生基本信息
 */
export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('students', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '学生ID - 主键'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '学生姓名'
    },
    studentNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'student_no',
      comment: '学号'
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
    classId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'class_id',
      comment: '班级ID - 外键关联班级表',
      references: {
        model: 'classes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    gender: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '性别 - 0:未知 1:男 2:女'
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'birth_date',
      comment: '出生日期'
    },
    idCardNo: {
      type: DataTypes.STRING(18),
      allowNull: true,
      field: 'id_card_no',
      comment: '身份证号'
    },
    householdAddress: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'household_address',
      comment: '户籍地址'
    },
    currentAddress: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'current_address',
      comment: '现居地址'
    },
    bloodType: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'blood_type',
      comment: '血型'
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '民族'
    },
    enrollmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'enrollment_date',
      comment: '入园日期'
    },
    graduationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'graduation_date',
      comment: '毕业日期'
    },
    healthCondition: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'health_condition',
      comment: '健康状况'
    },
    allergyHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'allergy_history',
      comment: '过敏史'
    },
    specialNeeds: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'special_needs',
      comment: '特殊需求'
    },
    photoUrl: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'photo_url',
      comment: '照片URL'
    },
    interests: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '兴趣爱好'
    },
    tags: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '标签'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态 - 0:离园 1:在读 2:休学'
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

  // 创建学号唯一索引
  await queryInterface.addIndex('students', ['student_no'], {
    unique: true,
    name: 'uk_student_no'
  });

  // 创建幼儿园ID索引
  await queryInterface.addIndex('students', ['kindergarten_id'], {
    name: 'idx_kindergarten_id'
  });

  // 创建班级ID索引
  await queryInterface.addIndex('students', ['class_id'], {
    name: 'idx_class_id'
  });
}

/**
 * 删除学生表
 */
export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('students');
} 