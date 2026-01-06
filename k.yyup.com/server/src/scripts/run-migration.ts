/**
 * 手动运行数据库迁移脚本
 */

import { sequelize } from '../init';
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

async function runMigration() {
  try {
    console.log('开始运行数据库迁移...');

    const queryInterface = sequelize.getQueryInterface();

    // 检查字段是否已经存在
    const tableDesc = await queryInterface.describeTable('parents');
    console.log('当前parents表字段:', Object.keys(tableDesc));

    // 添加分配教师字段
    if (!tableDesc['assigned_teacher_id']) {
      console.log('添加 assigned_teacher_id 字段...');
      await queryInterface.addColumn('parents', 'assigned_teacher_id', {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '分配的教师ID',
        references: {
          model: 'users',
          key: 'id'
        }
      });
    }

    // 添加是否公开字段
    if (!tableDesc['is_public']) {
      console.log('添加 is_public 字段...');
      await queryInterface.addColumn('parents', 'is_public', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否为公开客户（所有教师可见）'
      });
    }

    // 添加跟进状态字段
    if (!tableDesc['follow_status']) {
      console.log('添加 follow_status 字段...');
      await queryInterface.addColumn('parents', 'follow_status', {
        type: DataTypes.ENUM('待跟进', '跟进中', '已转化', '已放弃'),
        allowNull: false,
        defaultValue: '待跟进',
        comment: '跟进状态'
      });
    }

    // 添加客户优先级字段
    if (!tableDesc['priority']) {
      console.log('添加 priority 字段...');
      await queryInterface.addColumn('parents', 'priority', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: '客户优先级：1-高，2-中，3-低'
      });
    }

    // 添加最后跟进时间字段
    if (!tableDesc['last_followup_at']) {
      console.log('添加 last_followup_at 字段...');
      await queryInterface.addColumn('parents', 'last_followup_at', {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后跟进时间'
      });
    }

    console.log('✅ 数据库迁移完成');

    // 查看更新后的表结构
    const updatedTableDesc = await queryInterface.describeTable('parents');
    console.log('更新后的parents表字段:', Object.keys(updatedTableDesc));

  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

runMigration();