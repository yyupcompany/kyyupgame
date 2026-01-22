import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    console.log('🔄 开始创建 course_assignments 表...');

    await queryInterface.createTable('course_assignments', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: '分配ID'
      },
      course_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '课程ID',
        references: {
          model: 'custom_courses',
          key: 'id'
        }
      },
      teacher_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '教师ID',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      class_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '班级ID',
        references: {
          model: 'classes',
          key: 'id'
        }
      },
      assigned_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '分配人ID',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '分配时间'
      },
      status: {
        type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'paused'),
        allowNull: false,
        defaultValue: 'assigned',
        comment: '分配状态'
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '开始日期'
      },
      expected_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '预期结束日期'
      },
      actual_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '实际结束日期'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否有效'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '创建时间'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '更新时间'
      }
    });

    // 添加索引
    await queryInterface.addIndex('course_assignments', ['course_id'], { name: 'idx_course_assignments_course_id' });
    await queryInterface.addIndex('course_assignments', ['teacher_id'], { name: 'idx_course_assignments_teacher_id' });
    await queryInterface.addIndex('course_assignments', ['class_id'], { name: 'idx_course_assignments_class_id' });
    await queryInterface.addIndex('course_assignments', ['assigned_by'], { name: 'idx_course_assignments_assigned_by' });
    await queryInterface.addIndex('course_assignments', ['status'], { name: 'idx_course_assignments_status' });
    await queryInterface.addIndex('course_assignments', ['is_active'], { name: 'idx_course_assignments_is_active' });

    // 添加联合唯一索引
    await queryInterface.addIndex('course_assignments', ['course_id', 'teacher_id', 'class_id'], {
      name: 'idx_course_assignments_unique',
      unique: true
    });

    console.log('✅ course_assignments 表创建完成');
  },

  down: async (queryInterface: QueryInterface) => {
    console.log('🔄 开始删除 course_assignments 表...');
    await queryInterface.dropTable('course_assignments');
    console.log('✅ course_assignments 表已删除');
  }
};
