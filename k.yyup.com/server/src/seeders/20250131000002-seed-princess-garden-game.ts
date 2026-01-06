import { QueryInterface } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    const now = new Date();

    // 1. 添加公主花园找不同游戏配置
    await queryInterface.bulkInsert('game_configs', [
      {
        game_key: 'princess-garden',
        game_name: '公主花园找不同',
        game_type: 'attention',
        description: '仔细观察两幅美丽的公主花园场景，找出它们的不同之处。锻炼孩子的观察力和专注力。',
        icon_url: '/uploads/games/images/icons/princess-garden.png',
        cover_url: '/uploads/games/images/covers/princess-garden.png',
        min_age: 3,
        max_age: 6,
        gender_preference: 'female', // 女孩偏好
        difficulty_levels: JSON.stringify(['easy', 'medium', 'hard']),
        max_level: 10,
        status: 'active',
        order_index: 2,
        created_at: now,
        updated_at: now
      }
    ]);

    // 2. 添加关卡配置（10关）
    const levels = [];
    for (let i = 1; i <= 10; i++) {
      const difficulty = i <= 3 ? 'easy' : (i <= 6 ? 'medium' : 'hard');
      const differencesCount = i <= 3 ? 5 : (i <= 6 ? 7 : 10);
      const timeLimit = i <= 3 ? 180 : (i <= 6 ? 120 : 90); // 3分钟、2分钟、1.5分钟
      
      levels.push({
        game_key: 'princess-garden',
        level_number: i,
        level_name: `第${i}关`,
        difficulty,
        unlock_condition: JSON.stringify({
          min_level: i - 1,
          min_stars: i > 1 ? 1 : 0
        }),
        config: JSON.stringify({
          differences_count: differencesCount,
          time_limit: timeLimit,
          hints_available: 3,
          scene: `scene-${Math.ceil(i / 2)}` // 每2关用一个场景
        }),
        max_score: 1000,
        star_thresholds: JSON.stringify({
          three_star: { max_time: 60, max_hints_used: 0 },
          two_star: { max_time: 90, max_hints_used: 1 },
          one_star: { max_time: 999, max_hints_used: 3 }
        }),
        created_at: now,
        updated_at: now
      });
    }
    await queryInterface.bulkInsert('game_levels', levels);

    // 3. 添加成就配置
    await queryInterface.bulkInsert('game_achievements', [
      {
        achievement_key: 'princess_garden_first_find',
        achievement_name: '眼力超群',
        achievement_description: '第一次成功找到所有不同之处',
        game_key: 'princess-garden',
        condition_type: 'level_complete',
        condition_value: JSON.stringify({ level: 1 }),
        icon_url: '/uploads/games/images/achievements/first-find.png',
        reward_points: 10,
        created_at: now,
        updated_at: now
      },
      {
        achievement_key: 'princess_garden_perfect_observer',
        achievement_name: '完美观察家',
        achievement_description: '完美通关（3星）任意关卡',
        game_key: 'princess-garden',
        condition_type: 'perfect_level',
        condition_value: JSON.stringify({ stars: 3 }),
        icon_url: '/uploads/games/images/achievements/perfect-observer.png',
        reward_points: 30,
        created_at: now,
        updated_at: now
      },
      {
        achievement_key: 'princess_garden_master',
        achievement_name: '公主花园大师',
        achievement_description: '完成全部10关',
        game_key: 'princess-garden',
        condition_type: 'all_levels_complete',
        condition_value: JSON.stringify({ total_levels: 10 }),
        icon_url: '/uploads/games/images/achievements/garden-master.png',
        reward_points: 100,
        created_at: now,
        updated_at: now
      },
      {
        achievement_key: 'princess_garden_speed_finder',
        achievement_name: '闪电之眼',
        achievement_description: '30秒内找到所有不同',
        game_key: 'princess-garden',
        condition_type: 'speed_complete',
        condition_value: JSON.stringify({ max_time: 30 }),
        icon_url: '/uploads/games/images/achievements/speed-finder.png',
        reward_points: 50,
        created_at: now,
        updated_at: now
      }
    ]);

    console.log('✅ 公主花园找不同游戏数据已添加');
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    // 删除成就
    await queryInterface.bulkDelete('game_achievements', {
      game_key: 'princess-garden'
    });

    // 删除关卡
    await queryInterface.bulkDelete('game_levels', {
      game_key: 'princess-garden'
    });

    // 删除游戏配置
    await queryInterface.bulkDelete('game_configs', {
      game_key: 'princess-garden'
    });

    console.log('✅ 公主花园找不同游戏数据已删除');
  }
};

