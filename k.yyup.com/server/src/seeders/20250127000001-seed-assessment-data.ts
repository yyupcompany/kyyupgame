import { QueryInterface } from 'sequelize';

/**
 * 测评系统完整题库种子数据
 * 包含4个年龄段（2-3岁、3-4岁、4-5岁、5-6岁）
 * 每个年龄段6个维度，每个维度3-5道题目
 * 总计约200+道题目
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const now = new Date();

  // 1. 创建测评配置
  const configs = [
    {
      id: 1,
      name: '2-3岁发育商测评',
      description: '适用于24-36个月幼儿的发育商测评',
      minAge: 24,
      maxAge: 36,
      dimensions: JSON.stringify(['attention', 'memory', 'logic', 'language', 'motor', 'social']),
      status: 'active',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 2,
      name: '3-4岁发育商测评',
      description: '适用于36-48个月幼儿的发育商测评',
      minAge: 36,
      maxAge: 48,
      dimensions: JSON.stringify(['attention', 'memory', 'logic', 'language', 'motor', 'social']),
      status: 'active',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 3,
      name: '4-5岁发育商测评',
      description: '适用于48-60个月幼儿的发育商测评',
      minAge: 48,
      maxAge: 60,
      dimensions: JSON.stringify(['attention', 'memory', 'logic', 'language', 'motor', 'social']),
      status: 'active',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 4,
      name: '5-6岁发育商测评',
      description: '适用于60-72个月幼儿的发育商测评',
      minAge: 60,
      maxAge: 72,
      dimensions: JSON.stringify(['attention', 'memory', 'logic', 'language', 'motor', 'social']),
      status: 'active',
      createdAt: now,
      updatedAt: now
    }
  ];

  await queryInterface.bulkInsert('assessment_configs', configs);

  // 2. 创建完整题库数据
  const questions: any[] = [];

  // 题库生成函数
  const createQuestion = (configId: number, ageGroup: string, dimension: string, 
    questionType: string, title: string, content: any, gameConfig: any = null, 
    difficulty: number, score: number, sortOrder: number) => {
    return {
      configId,
      dimension,
      ageGroup,
      questionType,
      title,
      content: JSON.stringify(content),
      gameConfig: gameConfig ? JSON.stringify(gameConfig) : null,
      difficulty,
      score,
      sortOrder,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };
  };

  
  // ========== 专注力维度题目 ==========
  
  // 2-3岁专注力题目（5道）
  questions.push(
    // 找不同游戏
    createQuestion(1, '24-36', 'attention', 'game', '找不同游戏一',
      { description: '请仔细观察两幅图片，找出3处不同' },
      { gameType: 'attention', differencesCount: 3, difficulty: 1 },
      1, 10, 1),
    
    // 观察力测试
    createQuestion(1, '24-36', 'attention', 'qa', '观察动物大小',
      {
        question: '请指出哪个动物最大？',
        description: '请告诉孩子：大象、小猫、小鸟、小鱼，哪个最大？',
        options: [
          { label: 'A. 大象', value: 'elephant' },
          { label: 'B. 小猫', value: 'cat' },
          { label: 'C. 小鸟', value: 'bird' },
          { label: 'D. 小鱼', value: 'fish' }
        ],
        correctAnswer: 'elephant'
      },
      null, 1, 10, 2),
    
    // 找相同
    createQuestion(1, '24-36', 'attention', 'qa', '找相同物品',
      {
        question: '请找出两幅图中相同的物品',
        description: '可以给孩子展示两张图片，或者用语言描述：第一张图有苹果、香蕉、橙子、葡萄；第二张图有苹果、梨子、桃子、草莓。问孩子哪一个是相同的？',
        options: [
          { label: 'A. 苹果', value: 'apple' },
          { label: 'B. 香蕉', value: 'banana' },
          { label: 'C. 橙子', value: 'orange' },
          { label: 'D. 葡萄', value: 'grape' }
        ],
        correctAnswer: 'apple'
      },
      null, 1, 10, 3),
    
    // 视觉追踪
    createQuestion(1, '24-36', 'attention', 'qa', '追踪移动的物体',
      {
        question: '小兔子移动后停在哪里？',
        description: '可以给孩子讲一个故事：小兔子从草地上出发，经过大树下，最后停在哪里？或者用实际物品演示移动过程。',
        options: [
          { label: 'A. 草地上', value: 'grass' },
          { label: 'B. 大树下', value: 'tree' },
          { label: 'C. 房子旁', value: 'house' },
          { label: 'D. 花丛中', value: 'flower' }
        ],
        correctAnswer: 'tree'
      },
      null, 1, 10, 4),
    
    // 注意力持久性
    createQuestion(1, '24-36', 'attention', 'qa', '完成简单任务',
      {
        question: '能够持续完成一个简单任务多长时间？',
        options: [
          { label: 'A. 5分钟以上', value: '5+' },
          { label: 'B. 3-5分钟', value: '3-5' },
          { label: 'C. 1-3分钟', value: '1-3' },
          { label: 'D. 不到1分钟', value: '<1' }
        ],
        correctAnswer: '3-5'
      },
      null, 1, 10, 5)
  );

  // 3-4岁专注力题目（5道）
  questions.push(
    // 找不同游戏
    createQuestion(2, '36-48', 'attention', 'game', '找不同游戏二',
      { description: '请仔细观察两幅图片，找出5处不同' },
      { gameType: 'attention', differencesCount: 5, difficulty: 2 },
      2, 10, 1),
    
    // 观察细节
    createQuestion(2, '36-48', 'attention', 'qa', '观察图片细节',
      {
        question: '图片中有几只小鸟？',
        options: [
          { label: 'A. 1只', value: '1' },
          { label: 'B. 2只', value: '2' },
          { label: 'C. 3只', value: '3' },
          { label: 'D. 4只', value: '4' }
        ],
        correctAnswer: '3'
      },
      null, 2, 10, 2),
    
    // 视觉搜索
    createQuestion(2, '36-48', 'attention', 'qa', '寻找指定物品',
      {
        question: '请在图片中找到所有的红色物品',
        options: [
          { label: 'A. 找到3个', value: '3' },
          { label: 'B. 找到4个', value: '4' },
          { label: 'C. 找到5个', value: '5' },
          { label: 'D. 找到6个', value: '6' }
        ],
        correctAnswer: '5'
      },
      null, 2, 10, 3),
    
    // 注意力分配
    createQuestion(2, '36-48', 'attention', 'qa', '同时关注多个事物',
      {
        question: '能够同时关注几个事物？',
        options: [
          { label: 'A. 1个', value: '1' },
          { label: 'B. 2个', value: '2' },
          { label: 'C. 3个', value: '3' },
          { label: 'D. 4个以上', value: '4+' }
        ],
        correctAnswer: '2'
      },
      null, 2, 10, 4),
    
    // 选择性注意
    createQuestion(2, '36-48', 'attention', 'qa', '忽略干扰信息',
      {
        question: '在嘈杂的环境中能否专注于任务？',
        options: [
          { label: 'A. 能够很好专注', value: 'excellent' },
          { label: 'B. 需要提醒', value: 'remind' },
          { label: 'C. 容易分心', value: 'distract' },
          { label: 'D. 无法专注', value: 'none' }
        ],
        correctAnswer: 'remind'
      },
      null, 2, 10, 5)
  );

  // 4-5岁专注力题目（5道）
  questions.push(
    // 找不同游戏
    createQuestion(3, '48-60', 'attention', 'game', '找不同游戏三',
      { description: '请仔细观察两幅图片，找出7处不同' },
      { gameType: 'attention', differencesCount: 7, difficulty: 3 },
      3, 10, 1),
    
    // 复杂观察
    createQuestion(3, '48-60', 'attention', 'qa', '观察复杂场景',
      {
        question: '图片中发生了什么事情？',
        options: [
          { label: 'A. 小朋友在公园玩耍', value: 'park' },
          { label: 'B. 小朋友在图书馆读书', value: 'library' },
          { label: 'C. 小朋友在超市购物', value: 'supermarket' },
          { label: 'D. 小朋友在游乐园', value: 'playground' }
        ],
        correctAnswer: 'park'
      },
      null, 3, 10, 2),
    
    // 视觉记忆
    createQuestion(3, '48-60', 'attention', 'qa', '记住看到的物品',
      {
        question: '刚才看到的图片中有哪些颜色？',
        options: [
          { label: 'A. 红色、蓝色', value: 'rb' },
          { label: 'B. 红色、蓝色、黄色', value: 'rby' },
          { label: 'C. 红色、蓝色、黄色、绿色', value: 'rbyg' },
          { label: 'D. 不记得', value: 'none' }
        ],
        correctAnswer: 'rby'
      },
      null, 3, 10, 3),
    
    // 注意力转移
    createQuestion(3, '48-60', 'attention', 'qa', '快速切换注意力',
      {
        question: '能否快速从一件事转移到另一件事？',
        options: [
          { label: 'A. 能够快速切换', value: 'fast' },
          { label: 'B. 需要一点时间', value: 'medium' },
          { label: 'C. 需要较长时间', value: 'slow' },
          { label: 'D. 很难切换', value: 'difficult' }
        ],
        correctAnswer: 'medium'
      },
      null, 3, 10, 4),
    
    // 持续注意
    createQuestion(3, '48-60', 'attention', 'qa', '长时间专注任务',
      {
        question: '能够持续完成一个任务多长时间？',
        options: [
          { label: 'A. 15分钟以上', value: '15+' },
          { label: 'B. 10-15分钟', value: '10-15' },
          { label: 'C. 5-10分钟', value: '5-10' },
          { label: 'D. 不到5分钟', value: '<5' }
        ],
        correctAnswer: '10-15'
      },
      null, 3, 10, 5)
  );

  // 5-6岁专注力题目（5道）
  questions.push(
    // 找不同游戏
    createQuestion(4, '60-72', 'attention', 'game', '找不同游戏四',
      { description: '请仔细观察两幅图片，找出10处不同' },
      { gameType: 'attention', differencesCount: 10, difficulty: 4 },
      4, 10, 1),
    
    // 高级观察
    createQuestion(4, '60-72', 'attention', 'qa', '观察细微差别',
      {
        question: '两幅图片的细微差别在哪里？',
        options: [
          { label: 'A. 颜色不同', value: 'color' },
          { label: 'B. 形状不同', value: 'shape' },
          { label: 'C. 位置不同', value: 'position' },
          { label: 'D. 数量不同', value: 'number' }
        ],
        correctAnswer: 'position'
      },
      null, 4, 10, 2),
    
    // 注意力控制
    createQuestion(4, '60-72', 'attention', 'qa', '控制注意力',
      {
        question: '能否自主控制注意力集中？',
        options: [
          { label: 'A. 能够很好控制', value: 'excellent' },
          { label: 'B. 需要提醒', value: 'remind' },
          { label: 'C. 需要频繁提醒', value: 'often' },
          { label: 'D. 难以控制', value: 'difficult' }
        ],
        correctAnswer: 'remind'
      },
      null, 4, 10, 3),
    
    // 多任务处理
    createQuestion(4, '60-72', 'attention', 'qa', '处理多个任务',
      {
        question: '能否同时处理多个简单任务？',
        options: [
          { label: 'A. 能够很好处理', value: 'excellent' },
          { label: 'B. 能够处理', value: 'good' },
          { label: 'C. 处理有困难', value: 'difficult' },
          { label: 'D. 无法处理', value: 'none' }
        ],
        correctAnswer: 'good'
      },
      null, 4, 10, 4),
    
    // 注意力品质
    createQuestion(4, '60-72', 'attention', 'qa', '注意力品质评估',
      {
        question: '总体注意力表现如何？',
        options: [
          { label: 'A. 优秀', value: 'excellent' },
          { label: 'B. 良好', value: 'good' },
          { label: 'C. 一般', value: 'fair' },
          { label: 'D. 需要提升', value: 'poor' }
        ],
        correctAnswer: 'good'
      },
      null, 4, 10, 5)
  );

  
  // ========== 记忆力维度题目 ==========
  
  // 2-3岁记忆力题目（5道）
  questions.push(
    // 记忆卡片游戏
    createQuestion(1, '24-36', 'memory', 'game', '记忆卡片游戏一',
      { description: '请记住卡片的位置，然后找出3对相同的卡片' },
      { gameType: 'memory', cardCount: 6, difficulty: 1, showTime: 5000 },
      1, 10, 1),
    
    // 短期记忆
    createQuestion(1, '24-36', 'memory', 'qa', '记住简单物品',
      {
        question: '刚才看到的图片中有哪些物品？（选择3个）',
        options: [
          { label: 'A. 苹果、香蕉、橙子', value: 'fruits' },
          { label: 'B. 苹果、香蕉、汽车', value: 'mix1' },
          { label: 'C. 苹果、汽车、飞机', value: 'mix2' },
          { label: 'D. 香蕉、橙子、汽车', value: 'mix3' }
        ],
        correctAnswer: 'fruits'
      },
      null, 1, 10, 2),
    
    // 顺序记忆
    createQuestion(1, '24-36', 'memory', 'qa', '记住顺序',
      {
        question: '刚才看到的顺序是什么？',
        options: [
          { label: 'A. 苹果→香蕉→橙子', value: 'abc' },
          { label: 'B. 香蕉→苹果→橙子', value: 'bac' },
          { label: 'C. 橙子→苹果→香蕉', value: 'cab' },
          { label: 'D. 不记得', value: 'none' }
        ],
        correctAnswer: 'abc'
      },
      null, 1, 10, 3),
    
    // 视觉记忆
    createQuestion(1, '24-36', 'memory', 'qa', '记住看到的图案',
      {
        question: '刚才看到的图案是什么颜色？',
        options: [
          { label: 'A. 红色', value: 'red' },
          { label: 'B. 蓝色', value: 'blue' },
          { label: 'C. 黄色', value: 'yellow' },
          { label: 'D. 绿色', value: 'green' }
        ],
        correctAnswer: 'red'
      },
      null, 1, 10, 4),
    
    // 记忆保持
    createQuestion(1, '24-36', 'memory', 'qa', '记忆保持时间',
      {
        question: '能够记住刚才看到的内容多长时间？',
        options: [
          { label: 'A. 5分钟以上', value: '5+' },
          { label: 'B. 2-5分钟', value: '2-5' },
          { label: 'C. 1-2分钟', value: '1-2' },
          { label: 'D. 不到1分钟', value: '<1' }
        ],
        correctAnswer: '2-5'
      },
      null, 1, 10, 5)
  );

  // 3-4岁记忆力题目（5道）
  questions.push(
    // 记忆卡片游戏
    createQuestion(2, '36-48', 'memory', 'game', '记忆卡片游戏二',
      { description: '请记住卡片的位置，然后找出4对相同的卡片' },
      { gameType: 'memory', cardCount: 8, difficulty: 2, showTime: 4000 },
      2, 10, 1),
    
    // 工作记忆
    createQuestion(2, '36-48', 'memory', 'qa', '记住更多物品',
      {
        question: '刚才看到的图片中有哪些物品？（选择4个）',
        options: [
          { label: 'A. 苹果、香蕉、橙子、葡萄', value: 'all' },
          { label: 'B. 苹果、香蕉、橙子、汽车', value: 'mix1' },
          { label: 'C. 苹果、香蕉、汽车、飞机', value: 'mix2' },
          { label: 'D. 香蕉、橙子、葡萄、汽车', value: 'mix3' }
        ],
        correctAnswer: 'all'
      },
      null, 2, 10, 2),
    
    // 位置记忆
    createQuestion(2, '36-48', 'memory', 'qa', '记住位置',
      {
        question: '苹果在图片的哪个位置？',
        options: [
          { label: 'A. 左上角', value: 'top-left' },
          { label: 'B. 右上角', value: 'top-right' },
          { label: 'C. 左下角', value: 'bottom-left' },
          { label: 'D. 右下角', value: 'bottom-right' }
        ],
        correctAnswer: 'top-left'
      },
      null, 2, 10, 3),
    
    // 细节记忆
    createQuestion(2, '36-48', 'memory', 'qa', '记住细节',
      {
        question: '刚才看到的苹果是什么颜色？',
        options: [
          { label: 'A. 红色', value: 'red' },
          { label: 'B. 绿色', value: 'green' },
          { label: 'C. 黄色', value: 'yellow' },
          { label: 'D. 不记得', value: 'none' }
        ],
        correctAnswer: 'red'
      },
      null, 2, 10, 4),
    
    // 记忆策略
    createQuestion(2, '36-48', 'memory', 'qa', '使用记忆方法',
      {
        question: '是否会使用一些方法来帮助记忆？',
        options: [
          { label: 'A. 会重复念', value: 'repeat' },
          { label: 'B. 会联想', value: 'associate' },
          { label: 'C. 会分类', value: 'categorize' },
          { label: 'D. 不会用方法', value: 'none' }
        ],
        correctAnswer: 'repeat'
      },
      null, 2, 10, 5)
  );

  // 4-5岁记忆力题目（5道）
  questions.push(
    // 记忆卡片游戏
    createQuestion(3, '48-60', 'memory', 'game', '记忆卡片游戏三',
      { description: '请记住卡片的位置，然后找出6对相同的卡片' },
      { gameType: 'memory', cardCount: 12, difficulty: 3, showTime: 3000 },
      3, 10, 1),
    
    // 长时记忆
    createQuestion(3, '48-60', 'memory', 'qa', '记住复杂信息',
      {
        question: '能够记住多少天前发生的事情？',
        options: [
          { label: 'A. 一周前', value: 'week' },
          { label: 'B. 3-5天前', value: '3-5' },
          { label: 'C. 1-2天前', value: '1-2' },
          { label: 'D. 当天', value: 'today' }
        ],
        correctAnswer: '3-5'
      },
      null, 3, 10, 2),
    
    // 故事记忆
    createQuestion(3, '48-60', 'memory', 'qa', '记住故事内容',
      {
        question: '刚才听的故事中，主角是谁？',
        options: [
          { label: 'A. 小熊', value: 'bear' },
          { label: 'B. 小兔', value: 'rabbit' },
          { label: 'C. 小鸟', value: 'bird' },
          { label: 'D. 小猴', value: 'monkey' }
        ],
        correctAnswer: 'bear'
      },
      null, 3, 10, 3),
    
    // 数字记忆
    createQuestion(3, '48-60', 'memory', 'qa', '记住数字',
      {
        question: '刚才看到的数字是什么？',
        options: [
          { label: 'A. 123', value: '123' },
          { label: 'B. 234', value: '234' },
          { label: 'C. 345', value: '345' },
          { label: 'D. 456', value: '456' }
        ],
        correctAnswer: '234'
      },
      null, 3, 10, 4),
    
    // 记忆准确性
    createQuestion(3, '48-60', 'memory', 'qa', '记忆准确性',
      {
        question: '记住的内容是否准确？',
        options: [
          { label: 'A. 非常准确', value: 'excellent' },
          { label: 'B. 基本准确', value: 'good' },
          { label: 'C. 有些错误', value: 'fair' },
          { label: 'D. 错误较多', value: 'poor' }
        ],
        correctAnswer: 'good'
      },
      null, 3, 10, 5)
  );

  // 5-6岁记忆力题目（5道）
  questions.push(
    // 记忆卡片游戏
    createQuestion(4, '60-72', 'memory', 'game', '记忆卡片游戏四',
      { description: '请记住卡片的位置，然后找出8对相同的卡片' },
      { gameType: 'memory', cardCount: 16, difficulty: 4, showTime: 2000 },
      4, 10, 1),
    
    // 记忆容量
    createQuestion(4, '60-72', 'memory', 'qa', '记忆容量测试',
      {
        question: '能够同时记住多少个物品？',
        options: [
          { label: 'A. 8个以上', value: '8+' },
          { label: 'B. 6-8个', value: '6-8' },
          { label: 'C. 4-6个', value: '4-6' },
          { label: 'D. 不到4个', value: '<4' }
        ],
        correctAnswer: '6-8'
      },
      null, 4, 10, 2),
    
    // 记忆提取
    createQuestion(4, '60-72', 'memory', 'qa', '回忆信息',
      {
        question: '能否快速回忆起之前学过的内容？',
        options: [
          { label: 'A. 能够快速回忆', value: 'fast' },
          { label: 'B. 需要时间回忆', value: 'medium' },
          { label: 'C. 需要提示', value: 'hint' },
          { label: 'D. 难以回忆', value: 'difficult' }
        ],
        correctAnswer: 'medium'
      },
      null, 4, 10, 3),
    
    // 记忆应用
    createQuestion(4, '60-72', 'memory', 'qa', '应用记忆',
      {
        question: '能否将记住的内容应用到新情境？',
        options: [
          { label: 'A. 能够很好应用', value: 'excellent' },
          { label: 'B. 能够应用', value: 'good' },
          { label: 'C. 应用有困难', value: 'difficult' },
          { label: 'D. 无法应用', value: 'none' }
        ],
        correctAnswer: 'good'
      },
      null, 4, 10, 4),
    
    // 记忆系统
    createQuestion(4, '60-72', 'memory', 'qa', '记忆系统评估',
      {
        question: '总体记忆能力如何？',
        options: [
          { label: 'A. 优秀', value: 'excellent' },
          { label: 'B. 良好', value: 'good' },
          { label: 'C. 一般', value: 'fair' },
          { label: 'D. 需要提升', value: 'poor' }
        ],
        correctAnswer: 'good'
      },
      null, 4, 10, 5)
  );

  // ========== 逻辑思维维度题目 ==========
  
  // 2-3岁逻辑思维题目（5道）
  questions.push(
    // 分类游戏
    createQuestion(1, '24-36', 'logic', 'game', '分类游戏一',
      { description: '请将物品拖到正确的分类中' },
      { gameType: 'logic', itemCount: 6, difficulty: 1, categories: ['水果', '交通工具', '动物'] },
      1, 10, 1),
    
    // 简单分类
    createQuestion(1, '24-36', 'logic', 'qa', '分类认知',
      {
        question: '哪个是水果？',
        options: [
          { label: 'A. 苹果', value: 'apple' },
          { label: 'B. 汽车', value: 'car' },
          { label: 'C. 小狗', value: 'dog' },
          { label: 'D. 积木', value: 'block' }
        ],
        correctAnswer: 'apple'
      },
      null, 1, 10, 2),
    
    // 大小比较
    createQuestion(1, '24-36', 'logic', 'qa', '大小比较',
      {
        question: '哪个更大？',
        options: [
          { label: 'A. 大象', value: 'elephant' },
          { label: 'B. 小猫', value: 'cat' },
          { label: 'C. 小鸟', value: 'bird' },
          { label: 'D. 一样大', value: 'same' }
        ],
        correctAnswer: 'elephant'
      },
      null, 1, 10, 3),
    
    // 配对
    createQuestion(1, '24-36', 'logic', 'qa', '物品配对',
      {
        question: '哪个和苹果是一类的？',
        options: [
          { label: 'A. 香蕉', value: 'banana' },
          { label: 'B. 汽车', value: 'car' },
          { label: 'C. 小狗', value: 'dog' },
          { label: 'D. 椅子', value: 'chair' }
        ],
        correctAnswer: 'banana'
      },
      null, 1, 10, 4),
    
    // 简单推理
    createQuestion(1, '24-36', 'logic', 'qa', '简单推理',
      {
        question: '如果饿了，应该做什么？',
        options: [
          { label: 'A. 吃饭', value: 'eat' },
          { label: 'B. 睡觉', value: 'sleep' },
          { label: 'C. 玩耍', value: 'play' },
          { label: 'D. 跑步', value: 'run' }
        ],
        correctAnswer: 'eat'
      },
      null, 1, 10, 5)
  );

  // 3-4岁逻辑思维题目（5道）
  questions.push(
    // 分类游戏
    createQuestion(2, '36-48', 'logic', 'game', '分类游戏二',
      { description: '请将物品拖到正确的分类中' },
      { gameType: 'logic', itemCount: 9, difficulty: 2, categories: ['食物', '玩具', '衣物'] },
      2, 10, 1),
    
    // 排序
    createQuestion(2, '36-48', 'logic', 'qa', '大小排序',
      {
        question: '按照从大到小的顺序排列',
        options: [
          { label: 'A. 大象→老虎→小猫→小鸟', value: 'order1' },
          { label: 'B. 小鸟→小猫→老虎→大象', value: 'order2' },
          { label: 'C. 小猫→大象→小鸟→老虎', value: 'order3' },
          { label: 'D. 老虎→小鸟→大象→小猫', value: 'order4' }
        ],
        correctAnswer: 'order1'
      },
      null, 2, 10, 2),
    
    // 因果关系
    createQuestion(2, '36-48', 'logic', 'qa', '因果关系',
      {
        question: '为什么会下雨？',
        options: [
          { label: 'A. 因为云朵聚集', value: 'clouds' },
          { label: 'B. 因为太阳出来', value: 'sun' },
          { label: 'C. 因为刮风', value: 'wind' },
          { label: 'D. 因为天气热', value: 'hot' }
        ],
        correctAnswer: 'clouds'
      },
      null, 2, 10, 3),
    
    // 数量关系
    createQuestion(2, '36-48', 'logic', 'qa', '数量比较',
      {
        question: '哪个数量更多？',
        options: [
          { label: 'A. 3个苹果', value: '3' },
          { label: 'B. 5个香蕉', value: '5' },
          { label: 'C. 2个橙子', value: '2' },
          { label: 'D. 一样多', value: 'same' }
        ],
        correctAnswer: '5'
      },
      null, 2, 10, 4),
    
    // 问题解决
    createQuestion(2, '36-48', 'logic', 'qa', '解决问题',
      {
        question: '如果想要拿到高处的玩具，应该怎么做？',
        options: [
          { label: 'A. 爬上去', value: 'climb' },
          { label: 'B. 请大人帮忙', value: 'help' },
          { label: 'C. 放弃', value: 'giveup' },
          { label: 'D. 哭闹', value: 'cry' }
        ],
        correctAnswer: 'help'
      },
      null, 2, 10, 5)
  );

  // 4-5岁逻辑思维题目（5道）
  questions.push(
    // 分类游戏
    createQuestion(3, '48-60', 'logic', 'game', '分类游戏三',
      { description: '请将物品拖到正确的分类中' },
      { gameType: 'logic', itemCount: 12, difficulty: 3, categories: ['水果', '蔬菜', '肉类', '主食'] },
      3, 10, 1),
    
    // 序列推理
    createQuestion(3, '48-60', 'logic', 'qa', '找规律',
      {
        question: '按照规律，下一个应该是什么？',
        options: [
          { label: 'A. 圆形', value: 'circle' },
          { label: 'B. 三角形', value: 'triangle' },
          { label: 'C. 正方形', value: 'square' },
          { label: 'D. 菱形', value: 'diamond' }
        ],
        correctAnswer: 'circle'
      },
      null, 3, 10, 2),
    
    // 逻辑判断
    createQuestion(3, '48-60', 'logic', 'qa', '判断对错',
      {
        question: '以下哪个说法是正确的？',
        options: [
          { label: 'A. 所有的鸟都会飞', value: 'birds' },
          { label: 'B. 所有的鱼都会游泳', value: 'fish' },
          { label: 'C. 所有的动物都会说话', value: 'animals' },
          { label: 'D. 所有的植物都会走路', value: 'plants' }
        ],
        correctAnswer: 'fish'
      },
      null, 3, 10, 3),
    
    // 类比推理
    createQuestion(3, '48-60', 'logic', 'qa', '类比关系',
      {
        question: '苹果和水果的关系，就像汽车和什么的关系？',
        options: [
          { label: 'A. 交通工具', value: 'vehicle' },
          { label: 'B. 玩具', value: 'toy' },
          { label: 'C. 食物', value: 'food' },
          { label: 'D. 动物', value: 'animal' }
        ],
        correctAnswer: 'vehicle'
      },
      null, 3, 10, 4),
    
    // 复杂推理
    createQuestion(3, '48-60', 'logic', 'qa', '复杂推理',
      {
        question: '如果A比B大，B比C大，那么A和C谁大？',
        options: [
          { label: 'A. A大', value: 'a' },
          { label: 'B. C大', value: 'c' },
          { label: 'C. 一样大', value: 'same' },
          { label: 'D. 不知道', value: 'unknown' }
        ],
        correctAnswer: 'a'
      },
      null, 3, 10, 5)
  );

  // 5-6岁逻辑思维题目（5道）
  questions.push(
    // 分类游戏
    createQuestion(4, '60-72', 'logic', 'game', '分类游戏四',
      { description: '请将物品拖到正确的分类中' },
      { gameType: 'logic', itemCount: 15, difficulty: 4, categories: ['动物', '植物', '交通工具', '建筑物', '食物'] },
      4, 10, 1),
    
    // 数学逻辑
    createQuestion(4, '60-72', 'logic', 'qa', '数学推理',
      {
        question: '3+2等于多少？',
        options: [
          { label: 'A. 4', value: '4' },
          { label: 'B. 5', value: '5' },
          { label: 'C. 6', value: '6' },
          { label: 'D. 7', value: '7' }
        ],
        correctAnswer: '5'
      },
      null, 4, 10, 2),
    
    // 空间逻辑
    createQuestion(4, '60-72', 'logic', 'qa', '空间推理',
      {
        question: '从前面看到的形状，从上面看会是什么样？',
        options: [
          { label: 'A. 圆形', value: 'circle' },
          { label: 'B. 正方形', value: 'square' },
          { label: 'C. 三角形', value: 'triangle' },
          { label: 'D. 长方形', value: 'rectangle' }
        ],
        correctAnswer: 'circle'
      },
      null, 4, 10, 3),
    
    // 假设推理
    createQuestion(4, '60-72', 'logic', 'qa', '假设推理',
      {
        question: '如果所有的狗都会叫，那么这只小狗会做什么？',
        options: [
          { label: 'A. 会叫', value: 'bark' },
          { label: 'B. 会飞', value: 'fly' },
          { label: 'C. 会游泳', value: 'swim' },
          { label: 'D. 会说话', value: 'speak' }
        ],
        correctAnswer: 'bark'
      },
      null, 4, 10, 4),
    
    // 综合逻辑
    createQuestion(4, '60-72', 'logic', 'qa', '综合逻辑评估',
      {
        question: '总体逻辑思维能力如何？',
        options: [
          { label: 'A. 优秀', value: 'excellent' },
          { label: 'B. 良好', value: 'good' },
          { label: 'C. 一般', value: 'fair' },
          { label: 'D. 需要提升', value: 'poor' }
        ],
        correctAnswer: 'good'
      },
      null, 4, 10, 5)
  );

  
  // ========== 语言能力维度题目 ==========
  
  // 2-3岁语言能力题目（5道）
  questions.push(
    createQuestion(1, '24-36', 'language', 'qa', '词汇理解',
      {
        question: '请指出图片中哪个是"苹果"？',
        options: [
          { label: 'A. 香蕉', value: 'banana' },
          { label: 'B. 苹果', value: 'apple' },
          { label: 'C. 橙子', value: 'orange' },
          { label: 'D. 葡萄', value: 'grape' }
        ],
        correctAnswer: 'apple'
      },
      null, 1, 10, 1),
    
    createQuestion(1, '24-36', 'language', 'qa', '简单指令',
      {
        question: '能否理解简单的指令？',
        options: [
          { label: 'A. 完全理解', value: 'full' },
          { label: 'B. 大部分理解', value: 'most' },
          { label: 'C. 部分理解', value: 'some' },
          { label: 'D. 难以理解', value: 'few' }
        ],
        correctAnswer: 'most'
      },
      null, 1, 10, 2),
    
    createQuestion(1, '24-36', 'language', 'qa', '词汇量',
      {
        question: '能够说出多少个词语？',
        options: [
          { label: 'A. 200个以上', value: '200+' },
          { label: 'B. 100-200个', value: '100-200' },
          { label: 'C. 50-100个', value: '50-100' },
          { label: 'D. 不到50个', value: '<50' }
        ],
        correctAnswer: '100-200'
      },
      null, 1, 10, 3),
    
    createQuestion(1, '24-36', 'language', 'qa', '简单句子',
      {
        question: '能否说出简单的句子？',
        options: [
          { label: 'A. 能够说完整句子', value: 'full' },
          { label: 'B. 能够说短句', value: 'short' },
          { label: 'C. 只能说词语', value: 'word' },
          { label: 'D. 说话困难', value: 'difficult' }
        ],
        correctAnswer: 'short'
      },
      null, 1, 10, 4),
    
    createQuestion(1, '24-36', 'language', 'qa', '表达需求',
      {
        question: '能否用语言表达自己的需求？',
        options: [
          { label: 'A. 能够很好表达', value: 'excellent' },
          { label: 'B. 能够基本表达', value: 'good' },
          { label: 'C. 表达有困难', value: 'difficult' },
          { label: 'D. 无法表达', value: 'none' }
        ],
        correctAnswer: 'good'
      },
      null, 1, 10, 5)
  );

  // 3-4岁语言能力题目（5道）
  questions.push(
    createQuestion(2, '36-48', 'language', 'qa', '语言表达',
      {
        question: '请描述一下图片中的场景',
        options: [
          { label: 'A. 孩子在公园玩耍', value: 'park' },
          { label: 'B. 孩子在吃饭', value: 'eating' },
          { label: 'C. 孩子在睡觉', value: 'sleeping' },
          { label: 'D. 孩子在读书', value: 'reading' }
        ],
        correctAnswer: 'park'
      },
      null, 2, 10, 1),
    
    createQuestion(2, '36-48', 'language', 'qa', '词汇扩展',
      {
        question: '词汇量增长情况如何？',
        options: [
          { label: 'A. 快速增长', value: 'fast' },
          { label: 'B. 正常增长', value: 'normal' },
          { label: 'C. 增长较慢', value: 'slow' },
          { label: 'D. 增长困难', value: 'difficult' }
        ],
        correctAnswer: 'normal'
      },
      null, 2, 10, 2),
    
    createQuestion(2, '36-48', 'language', 'qa', '语法能力',
      {
        question: '能否使用正确的语法？',
        options: [
          { label: 'A. 语法正确', value: 'correct' },
          { label: 'B. 基本正确', value: 'mostly' },
          { label: 'C. 有错误', value: 'errors' },
          { label: 'D. 错误较多', value: 'many' }
        ],
        correctAnswer: 'mostly'
      },
      null, 2, 10, 3),
    
    createQuestion(2, '36-48', 'language', 'qa', '故事理解',
      {
        question: '能否理解简单的故事？',
        options: [
          { label: 'A. 完全理解', value: 'full' },
          { label: 'B. 大部分理解', value: 'most' },
          { label: 'C. 部分理解', value: 'some' },
          { label: 'D. 难以理解', value: 'few' }
        ],
        correctAnswer: 'most'
      },
      null, 2, 10, 4),
    
    createQuestion(2, '36-48', 'language', 'qa', '语言交流',
      {
        question: '能否进行简单的对话？',
        options: [
          { label: 'A. 能够很好对话', value: 'excellent' },
          { label: 'B. 能够对话', value: 'good' },
          { label: 'C. 对话有困难', value: 'difficult' },
          { label: 'D. 无法对话', value: 'none' }
        ],
        correctAnswer: 'good'
      },
      null, 2, 10, 5)
  );

  // 4-5岁语言能力题目（5道）
  questions.push(
    createQuestion(3, '48-60', 'language', 'qa', '语言逻辑',
      {
        question: '按照顺序排列：起床、吃早饭、上学',
        options: [
          { label: 'A. 起床→吃早饭→上学', value: 'order1' },
          { label: 'B. 吃早饭→起床→上学', value: 'order2' },
          { label: 'C. 上学→起床→吃早饭', value: 'order3' },
          { label: 'D. 起床→上学→吃早饭', value: 'order4' }
        ],
        correctAnswer: 'order1'
      },
      null, 3, 10, 1),
    
    createQuestion(3, '48-60', 'language', 'qa', '阅读理解',
      {
        question: '能否理解简单的文字？',
        options: [
          { label: 'A. 完全理解', value: 'full' },
          { label: 'B. 大部分理解', value: 'most' },
          { label: 'C. 部分理解', value: 'some' },
          { label: 'D. 难以理解', value: 'few' }
        ],
        correctAnswer: 'most'
      },
      null, 3, 10, 2),
    
    createQuestion(3, '48-60', 'language', 'qa', '语言创造',
      {
        question: '能否创造性地使用语言？',
        options: [
          { label: 'A. 能够创造', value: 'creative' },
          { label: 'B. 能够改编', value: 'adapt' },
          { label: 'C. 只能模仿', value: 'imitate' },
          { label: 'D. 困难', value: 'difficult' }
        ],
        correctAnswer: 'adapt'
      },
      null, 3, 10, 3),
    
    createQuestion(3, '48-60', 'language', 'qa', '描述能力',
      {
        question: '能否详细描述一个事件？',
        options: [
          { label: 'A. 能够详细描述', value: 'detailed' },
          { label: 'B. 能够简单描述', value: 'simple' },
          { label: 'C. 描述不完整', value: 'incomplete' },
          { label: 'D. 无法描述', value: 'none' }
        ],
        correctAnswer: 'simple'
      },
      null, 3, 10, 4),
    
    createQuestion(3, '48-60', 'language', 'qa', '语言应用',
      {
        question: '能否在不同情境中使用合适的语言？',
        options: [
          { label: 'A. 能够很好应用', value: 'excellent' },
          { label: 'B. 能够应用', value: 'good' },
          { label: 'C. 应用有困难', value: 'difficult' },
          { label: 'D. 无法应用', value: 'none' }
        ],
        correctAnswer: 'good'
      },
      null, 3, 10, 5)
  );

  // 5-6岁语言能力题目（5道）
  questions.push(
    createQuestion(4, '60-72', 'language', 'qa', '语言创造',
      {
        question: '用一句话描述图片中的故事',
        options: [
          { label: 'A. 简单描述', value: 'simple' },
          { label: 'B. 详细描述', value: 'detailed' },
          { label: 'C. 创造性描述', value: 'creative' },
          { label: 'D. 无法描述', value: 'none' }
        ],
        correctAnswer: 'creative'
      },
      null, 4, 10, 1),
    
    createQuestion(4, '60-72', 'language', 'qa', '语言复杂度',
      {
        question: '能否使用复杂的句子？',
        options: [
          { label: 'A. 能够使用复杂句', value: 'complex' },
          { label: 'B. 能够使用复合句', value: 'compound' },
          { label: 'C. 只能使用简单句', value: 'simple' },
          { label: 'D. 句子简单', value: 'basic' }
        ],
        correctAnswer: 'compound'
      },
      null, 4, 10, 2),
    
    createQuestion(4, '60-72', 'language', 'qa', '语言准确性',
      {
        question: '语言表达的准确性如何？',
        options: [
          { label: 'A. 非常准确', value: 'excellent' },
          { label: 'B. 基本准确', value: 'good' },
          { label: 'C. 有错误', value: 'errors' },
          { label: 'D. 错误较多', value: 'many' }
        ],
        correctAnswer: 'good'
      },
      null, 4, 10, 3),
    
    createQuestion(4, '60-72', 'language', 'qa', '语言流利度',
      {
        question: '语言表达的流利度如何？',
        options: [
          { label: 'A. 非常流利', value: 'excellent' },
          { label: 'B. 流利', value: 'good' },
          { label: 'C. 有停顿', value: 'pause' },
          { label: 'D. 不流利', value: 'poor' }
        ],
        correctAnswer: 'good'
      },
      null, 4, 10, 4),
    
    createQuestion(4, '60-72', 'language', 'qa', '语言综合评估',
      {
        question: '总体语言能力如何？',
        options: [
          { label: 'A. 优秀', value: 'excellent' },
          { label: 'B. 良好', value: 'good' },
          { label: 'C. 一般', value: 'fair' },
          { label: 'D. 需要提升', value: 'poor' }
        ],
        correctAnswer: 'good'
      },
      null, 4, 10, 5)
  );

  // ========== 精细动作维度题目 ==========
  
  // 2-3岁精细动作题目（5道）
  questions.push(
    createQuestion(1, '24-36', 'motor', 'qa', '精细动作',
      {
        question: '能够用积木搭建几层？',
        options: [
          { label: 'A. 2层', value: '2' },
          { label: 'B. 3层', value: '3' },
          { label: 'C. 4层', value: '4' },
          { label: 'D. 5层以上', value: '5+' }
        ],
        correctAnswer: '3'
      },
      null, 1, 10, 1),
    
    createQuestion(1, '24-36', 'motor', 'qa', '手部协调',
      {
        question: '能否用勺子吃饭？',
        options: [
          { label: 'A. 能够熟练使用', value: 'expert' },
          { label: 'B. 能够使用', value: 'good' },
          { label: 'C. 需要帮助', value: 'help' },
          { label: 'D. 无法使用', value: 'none' }
        ],
        correctAnswer: 'good'
      },
      null, 1, 10, 2),
    
    createQuestion(1, '24-36', 'motor', 'qa', '抓握能力',
      {
        question: '能否正确抓握物品？',
        options: [
          { label: 'A. 能够正确抓握', value: 'correct' },
          { label: 'B. 基本正确', value: 'mostly' },
          { label: 'C. 抓握有困难', value: 'difficult' },
          { label: 'D. 无法抓握', value: 'none' }
        ],
        correctAnswer: 'mostly'
      },
      null, 1, 10, 3),
    
    createQuestion(1, '24-36', 'motor', 'qa', '涂鸦能力',
      {
        question: '能否进行简单的涂鸦？',
        options: [
          { label: 'A. 能够涂鸦', value: 'yes' },
          { label: 'B. 需要引导', value: 'guide' },
          { label: 'C. 涂鸦困难', value: 'difficult' },
          { label: 'D. 无法涂鸦', value: 'none' }
        ],
        correctAnswer: 'yes'
      },
      null, 1, 10, 4),
    
    createQuestion(1, '24-36', 'motor', 'qa', '精细动作发展',
      {
        question: '精细动作发展情况如何？',
        options: [
          { label: 'A. 发展良好', value: 'good' },
          { label: 'B. 发展正常', value: 'normal' },
          { label: 'C. 发展较慢', value: 'slow' },
          { label: 'D. 发展困难', value: 'difficult' }
        ],
        correctAnswer: 'normal'
      },
      null, 1, 10, 5)
  );

  // 3-4岁精细动作题目（5道）
  questions.push(
    createQuestion(2, '36-48', 'motor', 'qa', '手眼协调',
      {
        question: '能够用剪刀剪纸吗？',
        options: [
          { label: 'A. 可以，很熟练', value: 'expert' },
          { label: 'B. 可以，但需要帮助', value: 'help' },
          { label: 'C. 不太会', value: 'beginner' },
          { label: 'D. 完全不会', value: 'none' }
        ],
        correctAnswer: 'help'
      },
      null, 2, 10, 1),
    
    createQuestion(2, '36-48', 'motor', 'qa', '绘画能力',
      {
        question: '能否画出简单的图形？',
        options: [
          { label: 'A. 能够画出', value: 'yes' },
          { label: 'B. 需要示范', value: 'demo' },
          { label: 'C. 画图困难', value: 'difficult' },
          { label: 'D. 无法画图', value: 'none' }
        ],
        correctAnswer: 'demo'
      },
      null, 2, 10, 2),
    
    createQuestion(2, '36-48', 'motor', 'qa', '拼插能力',
      {
        question: '能否完成简单的拼插？',
        options: [
          { label: 'A. 能够完成', value: 'yes' },
          { label: 'B. 需要帮助', value: 'help' },
          { label: 'C. 完成困难', value: 'difficult' },
          { label: 'D. 无法完成', value: 'none' }
        ],
        correctAnswer: 'yes'
      },
      null, 2, 10, 3),
    
    createQuestion(2, '36-48', 'motor', 'qa', '手指灵活性',
      {
        question: '手指灵活性如何？',
        options: [
          { label: 'A. 非常灵活', value: 'excellent' },
          { label: 'B. 灵活', value: 'good' },
          { label: 'C. 一般', value: 'fair' },
          { label: 'D. 不够灵活', value: 'poor' }
        ],
        correctAnswer: 'good'
      },
      null, 2, 10, 4),
    
    createQuestion(2, '36-48', 'motor', 'qa', '精细动作协调',
      {
        question: '精细动作协调性如何？',
        options: [
          { label: 'A. 协调良好', value: 'good' },
          { label: 'B. 基本协调', value: 'normal' },
          { label: 'C. 协调有困难', value: 'difficult' },
          { label: 'D. 不协调', value: 'poor' }
        ],
        correctAnswer: 'normal'
      },
      null, 2, 10, 5)
  );

  // 4-5岁精细动作题目（5道）
  questions.push(
    createQuestion(3, '48-60', 'motor', 'qa', '平衡能力',
      {
        question: '能够单脚站立几秒？',
        options: [
          { label: 'A. 10秒以上', value: '10+' },
          { label: 'B. 5-10秒', value: '5-10' },
          { label: 'C. 3-5秒', value: '3-5' },
          { label: 'D. 不到3秒', value: '<3' }
        ],
        correctAnswer: '5-10'
      },
      null, 3, 10, 1),
    
    createQuestion(3, '48-60', 'motor', 'qa', '书写准备',
      {
        question: '是否准备好学习书写？',
        options: [
          { label: 'A. 完全准备好', value: 'ready' },
          { label: 'B. 基本准备好', value: 'mostly' },
          { label: 'C. 需要练习', value: 'practice' },
          { label: 'D. 未准备好', value: 'not' }
        ],
        correctAnswer: 'mostly'
      },
      null, 3, 10, 2),
    
    createQuestion(3, '48-60', 'motor', 'qa', '手工制作',
      {
        question: '能否完成简单的手工制作？',
        options: [
          { label: 'A. 能够完成', value: 'yes' },
          { label: 'B. 需要帮助', value: 'help' },
          { label: 'C. 完成困难', value: 'difficult' },
          { label: 'D. 无法完成', value: 'none' }
        ],
        correctAnswer: 'yes'
      },
      null, 3, 10, 3),
    
    createQuestion(3, '48-60', 'motor', 'qa', '动作控制',
      {
        question: '动作控制能力如何？',
        options: [
          { label: 'A. 控制良好', value: 'good' },
          { label: 'B. 基本控制', value: 'normal' },
          { label: 'C. 控制有困难', value: 'difficult' },
          { label: 'D. 难以控制', value: 'poor' }
        ],
        correctAnswer: 'normal'
      },
      null, 3, 10, 4),
    
    createQuestion(3, '48-60', 'motor', 'qa', '动作精度',
      {
        question: '动作的精确度如何？',
        options: [
          { label: 'A. 非常精确', value: 'excellent' },
          { label: 'B. 精确', value: 'good' },
          { label: 'C. 基本精确', value: 'fair' },
          { label: 'D. 不够精确', value: 'poor' }
        ],
        correctAnswer: 'good'
      },
      null, 3, 10, 5)
  );

  // 5-6岁精细动作题目（5道）
  questions.push(
    createQuestion(4, '60-72', 'motor', 'qa', '综合运动',
      {
        question: '能够完成哪些运动项目？',
        options: [
          { label: 'A. 跳绳、拍球', value: 'multiple' },
          { label: 'B. 单一项目', value: 'single' },
          { label: 'C. 简单的运动', value: 'simple' },
          { label: 'D. 不擅长运动', value: 'none' }
        ],
        correctAnswer: 'multiple'
      },
      null, 4, 10, 1),
    
    createQuestion(4, '60-72', 'motor', 'qa', '书写能力',
      {
        question: '能否书写简单的汉字？',
        options: [
          { label: 'A. 能够书写', value: 'yes' },
          { label: 'B. 需要练习', value: 'practice' },
          { label: 'C. 书写困难', value: 'difficult' },
          { label: 'D. 无法书写', value: 'none' }
        ],
        correctAnswer: 'practice'
      },
      null, 4, 10, 2),
    
    createQuestion(4, '60-72', 'motor', 'qa', '动作协调',
      {
        question: '动作协调性如何？',
        options: [
          { label: 'A. 协调良好', value: 'good' },
          { label: 'B. 基本协调', value: 'normal' },
          { label: 'C. 协调有困难', value: 'difficult' },
          { label: 'D. 不协调', value: 'poor' }
        ],
        correctAnswer: 'normal'
      },
      null, 4, 10, 3),
    
    createQuestion(4, '60-72', 'motor', 'qa', '动作速度',
      {
        question: '动作速度如何？',
        options: [
          { label: 'A. 速度快', value: 'fast' },
          { label: 'B. 速度正常', value: 'normal' },
          { label: 'C. 速度较慢', value: 'slow' },
          { label: 'D. 速度很慢', value: 'veryslow' }
        ],
        correctAnswer: 'normal'
      },
      null, 4, 10, 4),
    
    createQuestion(4, '60-72', 'motor', 'qa', '精细动作综合',
      {
        question: '总体精细动作能力如何？',
        options: [
          { label: 'A. 优秀', value: 'excellent' },
          { label: 'B. 良好', value: 'good' },
          { label: 'C. 一般', value: 'fair' },
          { label: 'D. 需要提升', value: 'poor' }
        ],
        correctAnswer: 'good'
      },
      null, 4, 10, 5)
  );

  // ========== 社交能力维度题目 ==========
  
  // 2-3岁社交能力题目（5道）
  questions.push(
    createQuestion(1, '24-36', 'social', 'qa', '社交互动',
      {
        question: '能够和其他小朋友一起玩耍吗？',
        options: [
          { label: 'A. 经常一起玩', value: 'often' },
          { label: 'B. 偶尔一起玩', value: 'sometimes' },
          { label: 'C. 很少一起玩', value: 'rarely' },
          { label: 'D. 从不一起玩', value: 'never' }
        ],
        correctAnswer: 'sometimes'
      },
      null, 1, 10, 1),
    
    createQuestion(1, '24-36', 'social', 'qa', '情绪表达',
      {
        question: '能否用语言表达情绪？',
        options: [
          { label: 'A. 能够表达', value: 'yes' },
          { label: 'B. 部分表达', value: 'some' },
          { label: 'C. 表达困难', value: 'difficult' },
          { label: 'D. 无法表达', value: 'none' }
        ],
        correctAnswer: 'some'
      },
      null, 1, 10, 2),
    
    createQuestion(1, '24-36', 'social', 'qa', '分享行为',
      {
        question: '能否分享玩具给其他小朋友？',
        options: [
          { label: 'A. 能够分享', value: 'yes' },
          { label: 'B. 需要引导', value: 'guide' },
          { label: 'C. 不愿意分享', value: 'no' },
          { label: 'D. 拒绝分享', value: 'refuse' }
        ],
        correctAnswer: 'guide'
      },
      null, 1, 10, 3),
    
    createQuestion(1, '24-36', 'social', 'qa', '规则理解',
      {
        question: '能否理解简单的规则？',
        options: [
          { label: 'A. 完全理解', value: 'full' },
          { label: 'B. 大部分理解', value: 'most' },
          { label: 'C. 部分理解', value: 'some' },
          { label: 'D. 难以理解', value: 'few' }
        ],
        correctAnswer: 'most'
      },
      null, 1, 10, 4),
    
    createQuestion(1, '24-36', 'social', 'qa', '社交兴趣',
      {
        question: '对社交活动的兴趣如何？',
        options: [
          { label: 'A. 很感兴趣', value: 'high' },
          { label: 'B. 有兴趣', value: 'normal' },
          { label: 'C. 兴趣一般', value: 'low' },
          { label: 'D. 不感兴趣', value: 'none' }
        ],
        correctAnswer: 'normal'
      },
      null, 1, 10, 5)
  );

  // 3-4岁社交能力题目（5道）
  questions.push(
    createQuestion(2, '36-48', 'social', 'qa', '合作能力',
      {
        question: '能够和其他小朋友合作完成任务吗？',
        options: [
          { label: 'A. 能够很好地合作', value: 'good' },
          { label: 'B. 需要引导', value: 'guided' },
          { label: 'C. 不太会合作', value: 'poor' },
          { label: 'D. 完全不会', value: 'none' }
        ],
        correctAnswer: 'guided'
      },
      null, 2, 10, 1),
    
    createQuestion(2, '36-48', 'social', 'qa', '冲突处理',
      {
        question: '遇到冲突时如何处理？',
        options: [
          { label: 'A. 能够协商解决', value: 'negotiate' },
          { label: 'B. 需要成人帮助', value: 'help' },
          { label: 'C. 容易情绪化', value: 'emotional' },
          { label: 'D. 无法处理', value: 'none' }
        ],
        correctAnswer: 'help'
      },
      null, 2, 10, 2),
    
    createQuestion(2, '36-48', 'social', 'qa', '同理心',
      {
        question: '能否理解他人的感受？',
        options: [
          { label: 'A. 能够理解', value: 'yes' },
          { label: 'B. 部分理解', value: 'some' },
          { label: 'C. 理解困难', value: 'difficult' },
          { label: 'D. 无法理解', value: 'none' }
        ],
        correctAnswer: 'some'
      },
      null, 2, 10, 3),
    
    createQuestion(2, '36-48', 'social', 'qa', '沟通能力',
      {
        question: '沟通能力如何？',
        options: [
          { label: 'A. 沟通良好', value: 'good' },
          { label: 'B. 基本沟通', value: 'normal' },
          { label: 'C. 沟通有困难', value: 'difficult' },
          { label: 'D. 沟通困难', value: 'poor' }
        ],
        correctAnswer: 'normal'
      },
      null, 2, 10, 4),
    
    createQuestion(2, '36-48', 'social', 'qa', '社交主动性',
      {
        question: '社交主动性如何？',
        options: [
          { label: 'A. 主动社交', value: 'active' },
          { label: 'B. 正常社交', value: 'normal' },
          { label: 'C. 被动社交', value: 'passive' },
          { label: 'D. 回避社交', value: 'avoid' }
        ],
        correctAnswer: 'normal'
      },
      null, 2, 10, 5)
  );

  // 4-5岁社交能力题目（5道）
  questions.push(
    createQuestion(3, '48-60', 'social', 'qa', '情绪管理',
      {
        question: '遇到挫折时的表现如何？',
        options: [
          { label: 'A. 能够很好地处理', value: 'excellent' },
          { label: 'B. 需要安慰', value: 'comfort' },
          { label: 'C. 容易情绪失控', value: 'outburst' },
          { label: 'D. 无法处理', value: 'none' }
        ],
        correctAnswer: 'comfort'
      },
      null, 3, 10, 1),
    
    createQuestion(3, '48-60', 'social', 'qa', '团队合作',
      {
        question: '团队合作能力如何？',
        options: [
          { label: 'A. 合作良好', value: 'good' },
          { label: 'B. 基本合作', value: 'normal' },
          { label: 'C. 合作有困难', value: 'difficult' },
          { label: 'D. 无法合作', value: 'none' }
        ],
        correctAnswer: 'normal'
      },
      null, 3, 10, 2),
    
    createQuestion(3, '48-60', 'social', 'qa', '社交规则',
      {
        question: '能否遵守社交规则？',
        options: [
          { label: 'A. 完全遵守', value: 'full' },
          { label: 'B. 大部分遵守', value: 'most' },
          { label: 'C. 部分遵守', value: 'some' },
          { label: 'D. 难以遵守', value: 'few' }
        ],
        correctAnswer: 'most'
      },
      null, 3, 10, 3),
    
    createQuestion(3, '48-60', 'social', 'qa', '友谊建立',
      {
        question: '能否建立友谊？',
        options: [
          { label: 'A. 能够建立', value: 'yes' },
          { label: 'B. 需要时间', value: 'time' },
          { label: 'C. 建立困难', value: 'difficult' },
          { label: 'D. 无法建立', value: 'none' }
        ],
        correctAnswer: 'yes'
      },
      null, 3, 10, 4),
    
    createQuestion(3, '48-60', 'social', 'qa', '社交适应性',
      {
        question: '社交适应性如何？',
        options: [
          { label: 'A. 适应良好', value: 'good' },
          { label: 'B. 基本适应', value: 'normal' },
          { label: 'C. 适应有困难', value: 'difficult' },
          { label: 'D. 难以适应', value: 'poor' }
        ],
        correctAnswer: 'normal'
      },
      null, 3, 10, 5)
  );

  // 5-6岁社交能力题目（5道）
  questions.push(
    createQuestion(4, '60-72', 'social', 'qa', '领导能力',
      {
        question: '在游戏中是否能够组织其他小朋友？',
        options: [
          { label: 'A. 经常组织', value: 'often' },
          { label: 'B. 偶尔组织', value: 'sometimes' },
          { label: 'C. 跟随他人', value: 'follow' },
          { label: 'D. 独自玩耍', value: 'alone' }
        ],
        correctAnswer: 'sometimes'
      },
      null, 4, 10, 1),
    
    createQuestion(4, '60-72', 'social', 'qa', '社交策略',
      {
        question: '是否能够使用社交策略？',
        options: [
          { label: 'A. 能够使用', value: 'yes' },
          { label: 'B. 部分使用', value: 'some' },
          { label: 'C. 使用困难', value: 'difficult' },
          { label: 'D. 无法使用', value: 'none' }
        ],
        correctAnswer: 'some'
      },
      null, 4, 10, 2),
    
    createQuestion(4, '60-72', 'social', 'qa', '社交理解',
      {
        question: '社交情境理解能力如何？',
        options: [
          { label: 'A. 理解良好', value: 'good' },
          { label: 'B. 基本理解', value: 'normal' },
          { label: 'C. 理解有困难', value: 'difficult' },
          { label: 'D. 难以理解', value: 'poor' }
        ],
        correctAnswer: 'normal'
      },
      null, 4, 10, 3),
    
    createQuestion(4, '60-72', 'social', 'qa', '社交自信',
      {
        question: '社交自信心如何？',
        options: [
          { label: 'A. 非常自信', value: 'high' },
          { label: 'B. 自信', value: 'normal' },
          { label: 'C. 不太自信', value: 'low' },
          { label: 'D. 缺乏自信', value: 'verylow' }
        ],
        correctAnswer: 'normal'
      },
      null, 4, 10, 4),
    
    createQuestion(4, '60-72', 'social', 'qa', '社交能力综合',
      {
        question: '总体社交能力如何？',
        options: [
          { label: 'A. 优秀', value: 'excellent' },
          { label: 'B. 良好', value: 'good' },
          { label: 'C. 一般', value: 'fair' },
          { label: 'D. 需要提升', value: 'poor' }
        ],
        correctAnswer: 'good'
      },
      null, 4, 10, 5)
  );

  // 批量插入所有题目
  await queryInterface.bulkInsert('assessment_questions', questions);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('assessment_questions', {}, {});
  await queryInterface.bulkDelete('assessment_configs', {}, {});
}

