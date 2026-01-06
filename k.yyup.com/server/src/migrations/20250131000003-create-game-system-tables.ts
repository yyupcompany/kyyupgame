import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. 游戏配置表
  await queryInterface.createTable('game_configs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    game_key: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: '游戏唯一标识'
    },
    game_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '游戏名称'
    },
    game_type: {
      type: DataTypes.ENUM('attention', 'memory', 'logic'),
      allowNull: false,
      comment: '游戏类型'
    },
    theme_type: {
      type: DataTypes.ENUM('girl', 'boy', 'neutral'),
      allowNull: false,
      comment: '主题类型'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '游戏描述'
    },
    min_age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最小年龄（月）'
    },
    max_age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最大年龄（月）'
    },
    difficulty_levels: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '难度级别配置'
    },
    resources: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '资源清单'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // 2. 游戏关卡表
  await queryInterface.createTable('game_levels', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'game_configs',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    level_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '关卡编号'
    },
    level_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '关卡名称'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false
    },
    config: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '关卡配置（物品数量、时间等）'
    },
    unlock_condition: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '解锁条件'
    },
    star_requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '星级要求'
    },
    rewards: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '奖励'
    },
    status: {
      type: DataTypes.ENUM('active', 'locked'),
      defaultValue: 'active'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  await queryInterface.addIndex('game_levels', ['game_id', 'level_number'], {
    unique: true,
    name: 'unique_game_level'
  });

  // 3. 游戏记录表
  await queryInterface.createTable('game_records', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    child_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '儿童ID（如果是家长为孩子玩）'
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'game_configs',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    level_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'game_levels',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '星级（1-3）'
    },
    time_spent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用时（秒）'
    },
    accuracy: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: '准确率'
    },
    mistakes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '错误次数'
    },
    combo_max: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '最大连击数'
    },
    game_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '详细游戏数据'
    },
    completed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  await queryInterface.addIndex('game_records', ['user_id', 'game_id'], {
    name: 'idx_user_game'
  });
  await queryInterface.addIndex('game_records', ['completed_at'], {
    name: 'idx_completed'
  });

  // 4. 成就表
  await queryInterface.createTable('game_achievements', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    achievement_key: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    achievement_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('beginner', 'advanced', 'master', 'special'),
      allowNull: false
    },
    condition: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '解锁条件'
    },
    reward: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '奖励'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // 5. 用户成就表
  await queryInterface.createTable('user_achievements', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    child_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    achievement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'game_achievements',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    unlocked_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '当前进度'
    },
    is_notified: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '是否已通知'
    }
  });

  await queryInterface.addIndex('user_achievements', ['user_id', 'child_id', 'achievement_id'], {
    unique: true,
    name: 'unique_user_achievement'
  });

  // 6. 游戏设置表
  await queryInterface.createTable('game_user_settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    child_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bgm_volume: {
      type: DataTypes.FLOAT,
      defaultValue: 0.5,
      comment: '背景音乐音量（0-1）'
    },
    sfx_volume: {
      type: DataTypes.FLOAT,
      defaultValue: 0.8,
      comment: '音效音量（0-1）'
    },
    voice_volume: {
      type: DataTypes.FLOAT,
      defaultValue: 1.0,
      comment: '语音音量（0-1）'
    },
    difficulty_preference: {
      type: DataTypes.ENUM('auto', 'easy', 'medium', 'hard'),
      defaultValue: 'auto'
    },
    animation_speed: {
      type: DataTypes.FLOAT,
      defaultValue: 1.0,
      comment: '动画速度'
    },
    show_hints: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '是否显示提示'
    },
    vibration_enabled: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '震动反馈'
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '其他设置'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  await queryInterface.addIndex('game_user_settings', ['user_id', 'child_id'], {
    unique: true,
    name: 'unique_user_settings'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('user_achievements');
  await queryInterface.dropTable('game_user_settings');
  await queryInterface.dropTable('game_records');
  await queryInterface.dropTable('game_achievements');
  await queryInterface.dropTable('game_levels');
  await queryInterface.dropTable('game_configs');
}

