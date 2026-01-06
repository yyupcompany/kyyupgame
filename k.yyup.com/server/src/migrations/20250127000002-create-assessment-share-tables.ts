import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 创建分享日志表
  await queryInterface.createTable('assessment_share_logs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '测评记录ID',
      references: {
        model: 'assessment_records',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '分享用户ID',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    share_channel: {
      type: DataTypes.ENUM('wechat', 'moments', 'link', 'qrcode'),
      allowNull: false,
      comment: '分享渠道'
    },
    share_platform: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '分享平台'
    },
    share_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '分享次数'
    },
    scan_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '扫描次数'
    },
    conversion_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '转化次数（完成测评）'
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

  // 创建扫描日志表
  await queryInterface.createTable('assessment_scan_logs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '测评记录ID',
      references: {
        model: 'assessment_records',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    scanner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '扫描用户ID',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    scanner_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '扫描者电话'
    },
    source: {
      type: DataTypes.ENUM('qrcode', 'link'),
      allowNull: false,
      comment: '来源'
    },
    referrer_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '分享者用户ID',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 添加索引
  await queryInterface.addIndex('assessment_share_logs', ['record_id', 'user_id'], {
    name: 'idx_assessment_share_record_user'
  });
  await queryInterface.addIndex('assessment_share_logs', ['user_id'], {
    name: 'idx_assessment_share_user'
  });
  await queryInterface.addIndex('assessment_scan_logs', ['record_id'], {
    name: 'idx_assessment_scan_record'
  });
  await queryInterface.addIndex('assessment_scan_logs', ['referrer_user_id'], {
    name: 'idx_assessment_scan_referrer'
  });
  
  // 添加唯一索引（一个用户对一个记录的分享只记录一次）
  await queryInterface.addIndex('assessment_share_logs', ['record_id', 'user_id'], {
    name: 'idx_assessment_share_unique',
    unique: true
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('assessment_scan_logs');
  await queryInterface.dropTable('assessment_share_logs');
}
