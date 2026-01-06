import { DataTypes, QueryInterface } from 'sequelize';
import { sequelize } from '../init'; // Impor instance sequelize

/**
 * 创建班级教师关联表
 * 用于存储班级和教师的多对多关系
 */
export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface(); // Dapatkan queryInterface dari instance sequelize
  await queryInterface.createTable('class_teachers', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '关联ID - 主键'
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'class_id',
      comment: '班级ID - 外键关联班级表',
      // references: {
      //   model: 'classes',
      //   key: 'id'
      // },
      // onUpdate: 'CASCADE',
      // onDelete: 'CASCADE'
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'teacher_id',
      comment: '教师ID - 外键关联教师表',
      // references: {
      //   model: 'teachers',
      //   key: 'id'
      // },
      // onUpdate: 'CASCADE',
      // onDelete: 'CASCADE'
    },
    isMainTeacher: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: 'is_main_teacher',
      comment: '是否班主任 - 0:否 1:是'
    },
    subject: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '任教科目 - 如：语文、数学等'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
      comment: '开始任教日期'
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'end_date',
      comment: '结束任教日期'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态 - 0:离职 1:在职 2:请假中'
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

  // 创建唯一索引
  await queryInterface.addIndex('class_teachers', ['class_id', 'teacher_id'], {
    unique: true,
    name: 'uk_class_teacher'
  });

  // 创建教师ID索引
  await queryInterface.addIndex('class_teachers', ['teacher_id'], {
    name: 'idx_teacher_id'
  });

  // 创建班级ID索引
  await queryInterface.addIndex('class_teachers', ['class_id'], {
    name: 'idx_class_id'
  });
}

/**
 * 删除班级教师关联表
 */
export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface(); // Dapatkan queryInterface dari instance sequelize
  await queryInterface.dropTable('class_teachers');
} 