import request from '@/utils/request'

/**
 * 游戏API
 */
export const gamesApi = {
  // 获取游戏列表
  getGameList() {
    return request.get('/api/games/list')
  },

  // 获取游戏详情
  getGameDetail(gameKey: string) {
    return request.get(`/games/${gameKey}`)
  },

  // 获取游戏关卡
  getGameLevels(gameKey: string) {
    return request.get(`/games/${gameKey}/levels`)
  },

  // 保存游戏记录
  saveGameRecord(data: {
    childId?: number
    gameKey: string
    levelNumber: number
    score: number
    timeSpent: number
    accuracy?: number
    mistakes?: number
    comboMax?: number
    gameData?: any
  }) {
    return request.post('/api/games/record', data)
  },

  // 获取用户设置
  getUserSettings(childId?: number) {
    return request.get('/api/games/settings/user', {
      params: { childId }
    })
  },

  // 更新用户设置
  updateUserSettings(data: {
    childId?: number
    bgmVolume?: number
    sfxVolume?: number
    voiceVolume?: number
    difficultyPreference?: string
    animationSpeed?: number
    showHints?: number
    vibrationEnabled?: number
    settings?: any
  }) {
    return request.put('/api/games/settings/user', data)
  },

  // 获取游戏统计
  getStatistics(gameKey?: string) {
    return request.get('/api/games/statistics/user', {
      params: { gameKey }
    })
  },

  // 获取排行榜
  getLeaderboard(gameKey: string, levelNumber?: number, limit?: number) {
    return request.get(`/games/${gameKey}/leaderboard`, {
      params: { levelNumber, limit }
    })
  }
}




