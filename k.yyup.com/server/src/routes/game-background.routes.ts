import { verifyToken } from '../middlewares/auth.middleware';
import { Router } from 'express';
import { tenantOSS } from '../services/tenant-oss-router.service';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：verifyToken未导入，每个路由单独应用认证

/**
 * 获取游戏背景图片的签名URL
*/
router.get('/game-backgrounds/:gameKey', async (req, res) => {
  try {
    const { gameKey } = req.params;

    // 游戏背景图片文件映射
    const gameBackgroundFiles = {
      'princess-garden': 'princess-garden-bg.jpg',
      'space-treasure': 'space-treasure-bg.jpg',
      'animal-observer': 'animal-observer-bg.jpg',
      'princess-memory': 'princess-memory-bg.jpg',
      'dinosaur-memory': 'dinosaur-memory-bg.jpg',
      'fruit-sequence': 'fruit-sequence-bg.jpg',
      'dollhouse-tidy': 'dollhouse-tidy-bg.jpg',
      'robot-factory': 'robot-factory-bg.jpg',
      'color-sorting': 'color-sorting-bg.jpg'
    };

    const fileName = gameBackgroundFiles[gameKey];
    if (!fileName) {
      return res.json({
        success: false,
        error: 'Game not found',
        data: null
      });
    }

    // 游戏背景属于系统资源，使用system路径
    const ossPath = `kindergarten/system/games/images/${fileName}`;

    // 生成带签名的访问URL（有效期1小时）
    const signedUrl = tenantOSS.getTenantFileUrl(req, ossPath, 60);

    if (!signedUrl) {
      return res.json({
        success: false,
        error: 'OSS service unavailable or file not found',
        data: null
      });
    }

    return res.json({
      success: true,
      data: {
        gameKey,
        fileName,
        signedUrl,
        ossPath
      }
    });

  } catch (error) {
    console.error('[GAME]: 获取游戏背景图片URL失败:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      data: null
    });
  }
});

/**
 * 批量获取游戏背景图片的签名URL
*/
router.get('/game-backgrounds', async (req, res) => {
  try {
    const gameKeys = req.query.gameKeys;

    if (!gameKeys) {
      return res.status(400).json({
        success: false,
        error: 'gameKeys parameter is required',
        data: []
      });
    }

    const gameKeyArray = typeof gameKeys === 'string' ? gameKeys.split(',').map(key => key.trim()) : [];

    // 游戏背景图片文件映射
    const gameBackgroundFiles = {
      'princess-garden': 'princess-garden-bg.jpg',
      'space-treasure': 'space-treasure-bg.jpg',
      'animal-observer': 'animal-observer-bg.jpg',
      'princess-memory': 'princess-memory-bg.jpg',
      'dinosaur-memory': 'dinosaur-memory-bg.jpg',
      'fruit-sequence': 'fruit-sequence-bg.jpg',
      'dollhouse-tidy': 'dollhouse-tidy-bg.jpg',
      'robot-factory': 'robot-factory-bg.jpg',
      'color-sorting': 'color-sorting-bg.jpg'
    };

    // 使用租户OSS服务进行批量获取

    const backgroundUrls = await Promise.all(
      gameKeyArray.map(async (gameKey) => {
        const fileName = gameBackgroundFiles[gameKey];

        if (!fileName) {
          return {
            gameKey,
            fileName: null,
            signedUrl: null,
            error: 'Game not found'
          };
        }

        try {
          // 游戏背景属于系统资源，使用system路径
          const ossPath = `kindergarten/system/games/images/${fileName}`;
          const signedUrl = tenantOSS.getTenantFileUrl(req, ossPath, 60);

          if (!signedUrl) {
            return {
              gameKey,
              fileName,
              signedUrl: null,
              ossPath,
              error: 'File not found or OSS service unavailable'
            };
          }

          return {
            gameKey,
            fileName,
            signedUrl,
            ossPath,
            error: null
          };
        } catch (error) {
          console.error(`[GAME]: 生成${gameKey}背景图URL失败:`, error);
          return {
            gameKey,
            fileName,
            signedUrl: null,
            error: (error as Error).message
          };
        }
      })
    );

    return res.json({
      success: true,
      data: backgroundUrls
    });

  } catch (error) {
    console.error('[GAME]: 批量获取游戏背景图片URL失败:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      data: []
    });
  }
});

module.exports = router;