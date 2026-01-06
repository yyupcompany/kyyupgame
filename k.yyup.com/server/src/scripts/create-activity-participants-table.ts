/**
 * 创建活动参与者表的迁移脚本
 */

import { sequelize } from '../init';
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

async function createActivityParticipantsTable() {
  try {
    console.log('开始创建活动参与者表...');

    const queryInterface = sequelize.getQueryInterface();

    // 检查表是否已经存在
    const tables = await queryInterface.showAllTables();
    if (tables.includes('activity_participants')) {
      console.log('⚠️ 活动参与者表已存在，跳过创建');
      return;
    }

    // 创建活动参与者表
    await queryInterface.createTable('activity_participants', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      activity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '活动ID',
        references: {
          model: 'activities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '教师ID（用户表中role为teacher的用户）',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      access_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '访问级别：1-只读，2-管理，3-完全访问',
      },
      assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '分配人ID',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '分配时间',
      },
      can_view_registrations: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否可查看报名信息',
      },
      can_manage_registrations: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否可管理报名信息',
      },
      can_view_analytics: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否可查看数据分析',
      },
      can_export_data: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否可导出数据',
      },
      remark: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '备注说明',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否启用',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    console.log('✅ 活动参与者表创建成功');

    // 创建索引
    console.log('开始创建索引...');

    // 唯一索引：活动+教师组合唯一
    await queryInterface.addIndex('activity_participants',
      ['activity_id', 'teacher_id'],
      {
        unique: true,
        name: 'uk_activity_teacher',
      }
    );

    // 普通索引
    await queryInterface.addIndex('activity_participants',
      ['teacher_id'],
      { name: 'idx_teacher_id' }
    );

    await queryInterface.addIndex('activity_participants',
      ['activity_id'],
      { name: 'idx_activity_id' }
    );

    await queryInterface.addIndex('activity_participants',
      ['access_level'],
      { name: 'idx_access_level' }
    );

    console.log('✅ 索引创建成功');

    // 查看创建后的表结构
    const tableDesc = await queryInterface.describeTable('activity_participants');
    console.log('活动参与者表字段:', Object.keys(tableDesc));

  } catch (error) {
    console.error('❌ 创建活动参与者表失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createActivityParticipantsTable();