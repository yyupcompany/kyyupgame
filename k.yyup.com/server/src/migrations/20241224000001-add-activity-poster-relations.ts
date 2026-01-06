import { QueryInterface, DataTypes } from 'sequelize';

/**
 * 添加活动与海报的关联关系
 * 完善活动→海报→营销功能的业务链路
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. 在activities表中添加海报相关字段
  await queryInterface.addColumn('activities', 'poster_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的主海报ID',
    references: {
      model: 'poster_generations',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  await queryInterface.addColumn('activities', 'poster_url', {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '主海报URL'
  });

  await queryInterface.addColumn('activities', 'share_poster_url', {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '分享海报URL'
  });

  await queryInterface.addColumn('activities', 'marketing_config', {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '营销配置信息(团购、积分、分享等)'
  });

  await queryInterface.addColumn('activities', 'publish_status', {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '发布状态 - 0:草稿 1:已发布 2:已暂停'
  });

  await queryInterface.addColumn('activities', 'share_count', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '分享次数'
  });

  await queryInterface.addColumn('activities', 'view_count', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '浏览次数'
  });

  // 2. 创建活动海报关联表（支持一个活动多个海报）
  await queryInterface.createTable('activity_posters', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '关联ID'
    },
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '活动ID',
      references: {
        model: 'activities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    poster_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '海报ID',
      references: {
        model: 'poster_generations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    poster_type: {
      type: DataTypes.ENUM('main', 'share', 'detail', 'preview'),
      allowNull: false,
      defaultValue: 'main',
      comment: '海报类型 - main:主海报 share:分享海报 detail:详情海报 preview:预览海报'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 3. 创建活动分享记录表
  await queryInterface.createTable('activity_shares', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '分享记录ID'
    },
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '活动ID',
      references: {
        model: 'activities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    poster_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '分享的海报ID',
      references: {
        model: 'poster_generations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    share_channel: {
      type: DataTypes.ENUM('wechat', 'weibo', 'qq', 'link', 'qrcode', 'other'),
      allowNull: false,
      comment: '分享渠道'
    },
    share_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '分享链接'
    },
    sharer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '分享者ID',
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    share_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: '分享者IP'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 4. 添加索引
  await queryInterface.addIndex('activity_posters', ['activity_id']);
  await queryInterface.addIndex('activity_posters', ['poster_id']);
  await queryInterface.addIndex('activity_posters', ['activity_id', 'poster_type']);
  await queryInterface.addIndex('activity_shares', ['activity_id']);
  await queryInterface.addIndex('activity_shares', ['share_channel']);
  await queryInterface.addIndex('activity_shares', ['created_at']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // 删除表
  await queryInterface.dropTable('activity_shares');
  await queryInterface.dropTable('activity_posters');
  
  // 删除字段
  await queryInterface.removeColumn('activities', 'view_count');
  await queryInterface.removeColumn('activities', 'share_count');
  await queryInterface.removeColumn('activities', 'publish_status');
  await queryInterface.removeColumn('activities', 'marketing_config');
  await queryInterface.removeColumn('activities', 'share_poster_url');
  await queryInterface.removeColumn('activities', 'poster_url');
  await queryInterface.removeColumn('activities', 'poster_id');
}
