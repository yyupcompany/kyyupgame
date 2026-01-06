/**
 * 游戏配置系统
 * 用于统一管理游戏中各种硬编码的配置参数
 */

export interface GameConfig {
  // 通用游戏配置
  general: {
    maxLives: number;
    defaultLives: number;
    baseScore: number;
    comboMultiplier: number;
    volume: {
      background: number;
    soundEffects: number;
    voice: number;
    };
    accuracy: {
      threeStars: number;
      twoStars: number;
    };
  };

  // 关卡配置
  levels: {
    maxItems: number;
    itemSpeed: number;
    slowDownUses: number;
    progression: {
      beginner: {
        levelRange: [number, number];
        colors: number;
        speed: 'slow' | 'medium' | 'fast';
      };
      intermediate: {
        levelRange: [number, number];
        colors: number;
        speed: 'slow' | 'medium' | 'fast';
      };
      advanced: {
        levelRange: [number, number];
        colors: number;
        speed: 'slow' | 'medium' | 'fast';
      };
    };
  };

  // 颜色分类游戏配置
  colorSorting: {
    colors: Array<{
      name: string;
      color: string;
      colorKey: string;
    }>;
    basketColors: Array<{
      name: string;
      color: string;
      icon: string;
    }>;
    conveyor: {
      speed: {
        slow: number;
        medium: number;
        fast: number;
      };
      spawnInterval: number;
      maxItems: number;
    };
    scoring: {
      correctSort: number;
      wrongSort: number;
      missedItem: number;
    };
  };

  // 记忆游戏配置
  memory: {
    gridSizes: {
      easy: number;
      medium: number;
      hard: number;
    };
    cardFlipDelay: number;
    matchBonus: number;
    mismatchPenalty: number;
    timeBonus: {
      excellent: number;
      good: number;
      fair: number;
    };
  };

  // 反应力游戏配置
  reaction: {
    targetDisplayTime: number;
    timeLimit: number;
    scoreMultipliers: {
      excellent: number;
      good: number;
      fair: number;
    };
    difficultyProgression: {
      timeReduction: number;
      speedIncrease: number;
    };
  };

  // 成就系统配置
  achievements: {
    score: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
    };
    streak: {
      bronze: number;
      silver: number;
      gold: number;
    };
    accuracy: {
      bronze: number;
      silver: number;
      gold: number;
    };
    levels: {
      bronze: number;
      silver: number;
      gold: number;
    };
  };

  // 音效配置
  audio: {
    backgroundMusic: {
      volume: number;
      loop: boolean;
    };
    soundEffects: {
      correct: string;
      wrong: string;
      levelComplete: string;
      gameOver: string;
    };
    voice: {
      volume: number;
      language: 'zh-CN' | 'en-US';
    };
  };

  // UI配置
  ui: {
    animations: {
      fadeIn: number;
      slideIn: number;
      bounce: number;
      shake: number;
    };
    feedback: {
      correctColor: string;
      wrongColor: string;
      highlightColor: string;
    };
    timing: {
      messageDuration: number;
      transitionDuration: number;
    };
  };
}

// 默认游戏配置
export const defaultGameConfig: GameConfig = {
  general: {
    maxLives: 5,
    defaultLives: 3,
    baseScore: 100,
    comboMultiplier: 2,
    volume: {
      background: 0.3,
      soundEffects: 0.7,
      voice: 0.8
    },
    accuracy: {
      threeStars: 100,
      twoStars: 85
    }
  },

  levels: {
    maxItems: 10,
    itemSpeed: 0.5,
    slowDownUses: 2,
    progression: {
      beginner: {
        levelRange: [1, 2],
        colors: 3,
        speed: 'slow'
      },
      intermediate: {
        levelRange: [3, 4],
        colors: 4,
        speed: 'medium'
      },
      advanced: {
        levelRange: [5, 999],
        colors: 5,
        speed: 'fast'
      }
    }
  },

  colorSorting: {
    colors: [
      { name: '红色', color: '#ff0000', colorKey: 'red' },
      { name: '橙色', color: '#ff8800', colorKey: 'orange' },
      { name: '黄色', color: '#ffdd00', colorKey: 'yellow' },
      { name: '绿色', color: '#00cc00', colorKey: 'green' },
      { name: '蓝色', color: '#0088ff', colorKey: 'blue' },
      { name: '紫色', color: '#8800ff', colorKey: 'purple' }
    ],
    basketColors: [
      { name: '红色篮子', color: '#ff6b6b', icon: '🔴' },
      { name: '蓝色篮子', color: '#4dabf7', icon: '🔵' },
      { name: '绿色篮子', color: '#51cf66', icon: '🟢' },
      { name: '黄色篮子', color: '#ffd43b', icon: '🟡' },
      { name: '紫色篮子', color: '#9775fa', icon: '🟣' }
    ],
    conveyor: {
      speed: {
        slow: 0.3,
        medium: 0.5,
        fast: 0.8
      },
      spawnInterval: 2000,
      maxItems: 10
    },
    scoring: {
      correctSort: 100,
      wrongSort: -50,
      missedItem: -25
    }
  },

  memory: {
    gridSizes: {
      easy: 4,
      medium: 6,
      hard: 8
    },
    cardFlipDelay: 500,
    matchBonus: 50,
    mismatchPenalty: -10,
    timeBonus: {
      excellent: 100,
      good: 50,
      fair: 25
    }
  },

  reaction: {
    targetDisplayTime: 1000,
    timeLimit: 5000,
    scoreMultipliers: {
      excellent: 3,
      good: 2,
      fair: 1
    },
    difficultyProgression: {
      timeReduction: 100,
      speedIncrease: 0.1
    }
  },

  achievements: {
    score: {
      bronze: 1000,
      silver: 5000,
      gold: 10000,
      platinum: 20000
    },
    streak: {
      bronze: 5,
      silver: 10,
      gold: 20
    },
    accuracy: {
      bronze: 70,
      silver: 85,
      gold: 95
    },
    levels: {
      bronze: 5,
      silver: 10,
      gold: 20
    }
  },

  audio: {
    backgroundMusic: {
      volume: 0.3,
      loop: true
    },
    soundEffects: {
      correct: 'correct-sound.mp3',
      wrong: 'wrong-sound.mp3',
      levelComplete: 'level-complete.mp3',
      gameOver: 'game-over.mp3'
    },
    voice: {
      volume: 0.8,
      language: 'zh-CN'
    }
  },

  ui: {
    animations: {
      fadeIn: 300,
      slideIn: 400,
      bounce: 600,
      shake: 300
    },
    feedback: {
      correctColor: '#51cf66',
      wrongColor: '#ff6b6b',
      highlightColor: '#ffd43b'
    },
    timing: {
      messageDuration: 2000,
      transitionDuration: 300
    }
  }
};

// 游戏配置管理器
export class GameConfigManager {
  private static config: GameConfig = defaultGameConfig;

  /**
   * 获取游戏配置
   */
  static getConfig(): GameConfig {
    return this.config;
  }

  /**
   * 更新游戏配置
   */
  static updateConfig(newConfig: Partial<GameConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 重置为默认配置
   */
  static resetToDefault(): void {
    this.config = defaultGameConfig;
  }

  /**
   * 获取通用游戏配置
   */
  static getGeneralConfig() {
    return this.config.general;
  }

  /**
   * 获取关卡配置
   */
  static getLevelConfig() {
    return this.config.levels;
  }

  /**
   * 获取指定游戏类型的配置
   */
  static getGameConfig<T extends keyof Omit<GameConfig, 'general' | 'levels' | 'achievements' | 'audio' | 'ui'>>(gameType: T): GameConfig[T] {
    return this.config[gameType];
  }

  /**
   * 获取当前关卡的颜色配置
   */
  static getLevelColors(level: number): Array<{ name: string; color: string; colorKey: string }> {
    const progression = this.config.levels.progression;
    let colorCount = 3; // 默认3种颜色

    if (level >= progression.beginner.levelRange[0] && level <= progression.beginner.levelRange[1]) {
      colorCount = progression.beginner.colors;
    } else if (level >= progression.intermediate.levelRange[0] && level <= progression.intermediate.levelRange[1]) {
      colorCount = progression.intermediate.colors;
    } else if (level >= progression.advanced.levelRange[0]) {
      colorCount = progression.advanced.colors;
    }

    return this.config.colorSorting.colors.slice(0, colorCount);
  }

  /**
   * 获取当前关卡的篮子配置
   */
  static getLevelBaskets(level: number): Array<{ name: string; color: string; icon: string }> {
    const colors = this.getLevelColors(level);
    return this.config.colorSorting.basketColors.slice(0, colors.length);
  }

  /**
   * 获取当前关卡的速度
   */
  static getLevelSpeed(level: number): number {
    const progression = this.config.levels.progression;
    let speedKey = 'slow';

    if (level >= progression.beginner.levelRange[0] && level <= progression.beginner.levelRange[1]) {
      speedKey = progression.beginner.speed;
    } else if (level >= progression.intermediate.levelRange[0] && level <= progression.intermediate.levelRange[1]) {
      speedKey = progression.intermediate.speed;
    } else if (level >= progression.advanced.levelRange[0]) {
      speedKey = progression.advanced.speed;
    }

    return this.config.colorSorting.conveyor.speed[speedKey as keyof typeof this.config.colorSorting.conveyor.speed];
  }

  /**
   * 计算得分
   */
  static calculateScore(baseAction: string, combo: number = 1): number {
    const scoring = this.config.colorSorting.scoring;
    let baseScore = 0;

    switch (baseAction) {
      case 'correct':
        baseScore = scoring.correctSort;
        break;
      case 'wrong':
        baseScore = scoring.wrongSort;
        break;
      case 'missed':
        baseScore = scoring.missedItem;
        break;
      default:
        baseScore = this.config.general.baseScore;
    }

    return baseScore * (combo > 1 ? combo : 1);
  }

  /**
   * 计算星级评价
   */
  static calculateStars(accuracy: number, lives: number): number {
    const accuracyConfig = this.config.general.accuracy;
    const maxLives = this.config.general.maxLives;

    if (accuracy === accuracyConfig.threeStars && lives === maxLives) {
      return 3;
    } else if (accuracy >= accuracyConfig.twoStars) {
      return 2;
    } else {
      return 1;
    }
  }

  /**
   * 获取成就评价文本
   */
  static getAchievementText(stars: number): string {
    const texts = {
      3: '颜色大师！',
      2: '分类高手！',
      1: '继续努力！'
    };
    return texts[stars as keyof typeof texts] || texts[1];
  }

  /**
   * 获取音量配置
   */
  static getVolumeConfig() {
    return this.config.audio;
  }

  /**
   * 获取UI配置
   */
  static getUIConfig() {
    return this.config.ui;
  }

  /**
   * 验证游戏配置
   */
  static validateConfig(config: Partial<GameConfig>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    let isValid = true;

    // 验证生命值配置
    if (config.general?.maxLives && config.general.maxLives <= 0) {
      errors.push('最大生命值必须大于0');
      isValid = false;
    }

    if (config.general?.defaultLives && config.general.defaultLives > config.general?.maxLives) {
      errors.push('默认生命值不能大于最大生命值');
      isValid = false;
    }

    // 验证得分配置
    if (config.colorSorting?.scoring) {
      const scoring = config.colorSorting.scoring;
      if (scoring.correctSort <= 0) {
        errors.push('正确得分必须大于0');
        isValid = false;
      }
      if (scoring.wrongSort >= 0) {
        errors.push('错误得分应该为负数');
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  /**
   * 获取游戏难度描述
   */
  static getDifficultyDescription(level: number): {
    title: string;
    description: string;
    colors: number;
    speed: string;
  } {
    const progression = this.config.levels.progression;

    if (level >= progression.beginner.levelRange[0] && level <= progression.beginner.levelRange[1]) {
      return {
        title: '初级',
        description: '适合初学者',
        colors: progression.beginner.colors,
        speed: progression.beginner.speed
      };
    } else if (level >= progression.intermediate.levelRange[0] && level <= progression.intermediate.levelRange[1]) {
      return {
        title: '中级',
        description: '需要一定技巧',
        colors: progression.intermediate.colors,
        speed: progression.intermediate.speed
      };
    } else {
      return {
        title: '高级',
        description: '挑战极限',
        colors: progression.advanced.colors,
        speed: progression.advanced.speed
      };
    }
  }
}

export default GameConfigManager;