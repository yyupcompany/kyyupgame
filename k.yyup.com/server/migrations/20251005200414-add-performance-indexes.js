'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚀 [Migration] 开始添加性能优化索引...');

    try {
      // AI消息表索引
      console.log('📊 [Migration] 添加 ai_messages 表索引...');
      await queryInterface.addIndex('ai_messages', ['conversation_id'], {
        name: 'idx_ai_messages_conversation_id',
        concurrently: true
      });
      await queryInterface.addIndex('ai_messages', ['user_id', 'created_at'], {
        name: 'idx_ai_messages_user_created',
        concurrently: true
      });
      await queryInterface.addIndex('ai_messages', ['role'], {
        name: 'idx_ai_messages_role',
        concurrently: true
      });

      // AI对话表索引
      console.log('📊 [Migration] 添加 ai_conversations 表索引...');
      await queryInterface.addIndex('ai_conversations', ['user_id', 'status'], {
        name: 'idx_ai_conversations_user_status',
        concurrently: true
      });
      await queryInterface.addIndex('ai_conversations', ['updated_at'], {
        name: 'idx_ai_conversations_updated',
        concurrently: true
      });

      // 学生表索引
      console.log('📊 [Migration] 添加 students 表索引...');
      await queryInterface.addIndex('students', ['status'], {
        name: 'idx_students_status',
        concurrently: true
      });
      await queryInterface.addIndex('students', ['class_id'], {
        name: 'idx_students_class',
        concurrently: true
      });
      await queryInterface.addIndex('students', ['kindergarten_id'], {
        name: 'idx_students_kindergarten',
        concurrently: true
      });

      // 活动表索引
      console.log('📊 [Migration] 添加 activities 表索引...');
      await queryInterface.addIndex('activities', ['start_time', 'end_time'], {
        name: 'idx_activities_time_range',
        concurrently: true
      });
      await queryInterface.addIndex('activities', ['status'], {
        name: 'idx_activities_status',
        concurrently: true
      });
      await queryInterface.addIndex('activities', ['kindergarten_id'], {
        name: 'idx_activities_kindergarten',
        concurrently: true
      });

      // 用户权限表索引
      console.log('📊 [Migration] 添加 user_permissions 表索引...');
      await queryInterface.addIndex('user_permissions', ['user_id', 'permission_id'], {
        name: 'idx_user_permissions_user_permission',
        unique: true,
        concurrently: true
      });

      // 教师表索引
      console.log('📊 [Migration] 添加 teachers 表索引...');
      await queryInterface.addIndex('teachers', ['status'], {
        name: 'idx_teachers_status',
        concurrently: true
      });
      await queryInterface.addIndex('teachers', ['kindergarten_id'], {
        name: 'idx_teachers_kindergarten',
        concurrently: true
      });

      // 班级表索引
      console.log('📊 [Migration] 添加 classes 表索引...');
      await queryInterface.addIndex('classes', ['kindergarten_id'], {
        name: 'idx_classes_kindergarten',
        concurrently: true
      });
      await queryInterface.addIndex('classes', ['status'], {
        name: 'idx_classes_status',
        concurrently: true
      });

      // 招生申请表索引
      console.log('📊 [Migration] 添加 enrollment_applications 表索引...');
      await queryInterface.addIndex('enrollment_applications', ['status'], {
        name: 'idx_enrollment_applications_status',
        concurrently: true
      });
      await queryInterface.addIndex('enrollment_applications', ['kindergarten_id'], {
        name: 'idx_enrollment_applications_kindergarten',
        concurrently: true
      });
      await queryInterface.addIndex('enrollment_applications', ['created_at'], {
        name: 'idx_enrollment_applications_created',
        concurrently: true
      });

      console.log('✅ [Migration] 性能优化索引添加完成！');
    } catch (error) {
      console.error('❌ [Migration] 添加索引失败:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 [Migration] 开始移除性能优化索引...');

    try {
      // AI消息表索引
      await queryInterface.removeIndex('ai_messages', 'idx_ai_messages_conversation_id');
      await queryInterface.removeIndex('ai_messages', 'idx_ai_messages_user_created');
      await queryInterface.removeIndex('ai_messages', 'idx_ai_messages_role');

      // AI对话表索引
      await queryInterface.removeIndex('ai_conversations', 'idx_ai_conversations_user_status');
      await queryInterface.removeIndex('ai_conversations', 'idx_ai_conversations_updated');

      // 学生表索引
      await queryInterface.removeIndex('students', 'idx_students_status');
      await queryInterface.removeIndex('students', 'idx_students_class');
      await queryInterface.removeIndex('students', 'idx_students_kindergarten');

      // 活动表索引
      await queryInterface.removeIndex('activities', 'idx_activities_time_range');
      await queryInterface.removeIndex('activities', 'idx_activities_status');
      await queryInterface.removeIndex('activities', 'idx_activities_kindergarten');

      // 用户权限表索引
      await queryInterface.removeIndex('user_permissions', 'idx_user_permissions_user_permission');

      // 教师表索引
      await queryInterface.removeIndex('teachers', 'idx_teachers_status');
      await queryInterface.removeIndex('teachers', 'idx_teachers_kindergarten');

      // 班级表索引
      await queryInterface.removeIndex('classes', 'idx_classes_kindergarten');
      await queryInterface.removeIndex('classes', 'idx_classes_status');

      // 招生申请表索引
      await queryInterface.removeIndex('enrollment_applications', 'idx_enrollment_applications_status');
      await queryInterface.removeIndex('enrollment_applications', 'idx_enrollment_applications_kindergarten');
      await queryInterface.removeIndex('enrollment_applications', 'idx_enrollment_applications_created');

      console.log('✅ [Migration] 性能优化索引移除完成！');
    } catch (error) {
      console.error('❌ [Migration] 移除索引失败:', error);
      throw error;
    }
  }
};
