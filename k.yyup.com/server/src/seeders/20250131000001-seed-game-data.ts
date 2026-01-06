import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. 插入游戏配置
  await queryInterface.bulkInsert('game_configs', [
    {
      game_key: 'fruit-sequence',
      game_name: '水果记忆大师',
      game_type: 'memory',
      theme_type: 'neutral',
      description: 'Simon Says风格的序列记忆游戏，锻炼记忆力和反应力',
      min_age: 36,
      max_age: 72,
      difficulty_levels: JSON.stringify({
        easy: { sequenceLength: '3-5', fruitCount: 3 },
        medium: { sequenceLength: '5-8', fruitCount: 6 },
        hard: { sequenceLength: '8-12', fruitCount: 9 }
      }),
      resources: JSON.stringify({
        fruits: ['apple', 'banana', 'strawberry', 'grape', 'orange', 'watermelon', 
                 'cherry', 'pineapple', 'peach', 'lemon', 'kiwi', 'mango']
      }),
      status: 'active',
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // 2. 插入关卡配置
  const fruitGameId = 1; // 假设水果游戏是第一个
  
  const levels = [];
  for (let i = 1; i <= 10; i++) {
    levels.push({
      game_id: fruitGameId,
      level_number: i,
      level_name: `第${i}关`,
      difficulty: i <= 3 ? 'easy' : i <= 7 ? 'medium' : 'hard',
      config: JSON.stringify({
        sequenceLength: Math.min(2 + i, 12),
        fruitCount: Math.min(3 + Math.floor((i - 1) / 2), 9),
        lives: 3
      }),
      unlock_condition: JSON.stringify(
        i === 1 ? null : { previousLevel: i - 1, minStars: 1 }
      ),
      star_requirements: JSON.stringify({
        oneStar: { complete: true },
        twoStars: { complete: true, maxMistakes: 2 },
        threeStars: { complete: true, maxMistakes: 0 }
      }),
      rewards: JSON.stringify({
        coins: i * 50,
        exp: i * 20
      }),
      status: 'active',
      created_at: new Date()
    });
  }
  
  await queryInterface.bulkInsert('game_levels', levels);

  // 3. 插入成就
  await queryInterface.bulkInsert('game_achievements', [
    {
      achievement_key: 'first-game',
      achievement_name: '初次尝试',
      description: '完成第一个游戏',
      icon_url: '/uploads/games/images/achievements/first-game.png',
      category: 'beginner',
      condition: JSON.stringify({ type: 'totalGames', value: 1 }),
      reward: JSON.stringify({ coins: 100 }),
      sort_order: 1,
      created_at: new Date()
    },
    {
      achievement_key: 'memory-master',
      achievement_name: '记忆天才',
      description: '水果序列达到10个',
      icon_url: '/uploads/games/images/achievements/memory-master.png',
      category: 'advanced',
      condition: JSON.stringify({ type: 'sequenceLength', value: 10 }),
      reward: JSON.stringify({ coins: 500 }),
      sort_order: 2,
      created_at: new Date()
    },
    {
      achievement_key: 'perfect-player',
      achievement_name: '完美主义者',
      description: '0失误通关10次',
      icon_url: '/uploads/games/images/achievements/perfect.png',
      category: 'master',
      condition: JSON.stringify({ type: 'perfectGame', value: 10 }),
      reward: JSON.stringify({ coins: 1000, title: '完美大师' }),
      sort_order: 3,
      created_at: new Date()
    }
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('game_achievements', {});
  await queryInterface.bulkDelete('game_levels', {});
  await queryInterface.bulkDelete('game_configs', {});
}

