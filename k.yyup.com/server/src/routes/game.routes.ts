/**
* @swagger
* components:
*   schemas:
*     Game:
*      type: object
*      properties:
*        id:
*          type: integer
*          description: Game ID
*          example: 1
*        name:
*          type: string
*          description: Game 名称
*          example: "示例Game"
*        status:
*          type: string
*          description: 状态
*          example: "active"
*        createdAt:
*          type: string
*          format: date-time
*          description: 创建时间
*          example: "2024-01-01T00:00:00.000Z"
*        updatedAt:
*          type: string
*          format: date-time
*          description: 更新时间
*          example: "2024-01-01T00:00:00.000Z"
*    CreateGameRequest:
*      type: object
*      required:
*        - name
*      properties:
*        name:
*          type: string
*          description: Game 名称
*          example: "新Game"
*    UpdateGameRequest:
*      type: object
*      properties:
*        name:
*          type: string
*          description: Game 名称
*          example: "更新后的Game"
*    GameListResponse:
*      type: object
*      properties:
*        success:
*          type: boolean
*          example: true
*        data:
*          type: object
*          properties:
*            list:
*              type: array
*              items:
*                $ref: '#/components/schemas/Game'
*        message:
*          type: string
*          example: "获取game列表成功"
*    GameResponse:
*      type: object
*      properties:
*        success:
*          type: boolean
*          example: true
*        data:
*          $ref: '#/components/schemas/Game'
*        message:
*          type: string
*          example: "操作成功"
*    ErrorResponse:
*      type: object
*      properties:
*        success:
*          type: boolean
*          example: false
*        code:
*          type: string
*          example: "INTERNAL_ERROR"
*        message:
*          type: string
*          example: "操作失败"
*  securitySchemes:
*    bearerAuth:
*      type: http
*      scheme: bearer
*      bearerFormat: JWT
*/

/**
* game管理路由文件
* 提供game的基础CRUD操作
*
* 功能包括：
* - 获取game列表
* - 创建新game
* - 获取game详情
* - 更新game信息
 * - 删除game
*
 * 权限要求：需要有效的JWT Token认证
*/

import express from 'express';
import { gameController } from '../controllers/game.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
* @swagger
 * /game/list:
 *   get:
 *     summary: 获取游戏列表
 *     description: 获取当前用户可访问的游戏列表，包括游戏基本信息、进度状态、解锁条件等。支持按类型、难度、状态等条件筛选。
 *     tags: [游戏管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [educational, puzzle, action, strategy, creative, sports]
 *         description: 游戏分类筛选
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard, expert]
 *         description: 难度筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, locked, completed, in_progress]
 *         description: 状态筛选
 *       - in: query
 *         name: ageGroup
 *         schema:
 *           type: string
 *           enum: [3-5, 6-8, 9-12, 13+]
 *         description: 年龄组筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: 搜索关键词（游戏名称或描述）
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, difficulty, popularity, rating, createdAt]
 *           default: "popularity"
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: 排序方向
 *       - in: query
 *         name: includeProgress
 *         schema:
 *           type: boolean
 *           default: true
 *         description: 是否包含用户进度信息
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 5
 *           maximum: 50
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取游戏列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取游戏列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     games:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GameSummary'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["educational", "puzzle", "creative"]
 *                     userStats:
 *                       type: object
 *                       properties:
 *                         totalGamesPlayed:
 *                           type: integer
 *                           example: 15
 *                         totalGameTime:
 *                           type: integer
 *                           example: 1200
 *                         achievements:
 *                           type: integer
 *                           example: 8
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.get('/list', verifyToken, gameController.getGameList);

/**
* @swagger
 * /game/{gameKey}:
 *   get:
 *     summary: 获取游戏详情
 *     description: 根据游戏键值获取游戏的详细信息，包括游戏配置、关卡信息、用户进度、成就系统等完整数据。
 *     tags: [游戏管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameKey
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *           maxLength: 50
 *         description: 游戏唯一标识键
 *       - in: query
 *         name: includeProgress
 *         schema:
 *           type: boolean
 *           default: true
 *         description: 是否包含用户游戏进度
 *       - in: query
 *         name: includeLevels
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含关卡详细信息
 *       - in: query
 *         name: includeAchievements
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含成就信息
 *       - in: query
 *         name: includeLeaderboard
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含排行榜信息
 *     responses:
 *       200:
 *         description: 获取游戏详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取游戏详情成功"
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/GameDetail'
 *                     - type: object
 *                       properties:
 *                         userProgress:
 *                           $ref: '#/components/schemas/GameProgress'
 *                         userSettings:
 *                           type: object
 *                           properties:
 *                             soundEnabled:
 *                               type: boolean
 *                               example: true
 *                             musicVolume:
 *                               type: number
 *                               minimum: 0
 *                               maximum: 100
 *                               example: 70
 *                             controlScheme:
 *                               type: string
 *                               example: "touch"
 *                             difficulty:
 *                               type: string
 *                               example: "medium"
 *                         recommendations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/GameSummary'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.get('/:gameKey', verifyToken, gameController.getGameDetail);

/**
* @swagger
 * /game/{gameKey}/levels:
 *   get:
 *     summary: 获取游戏关卡列表
 *     description: 获取指定游戏的所有关卡信息，包括关卡配置、解锁条件、用户进度、成绩记录等。
 *     tags: [游戏管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameKey
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *           maxLength: 50
 *         description: 游戏唯一标识键
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, unlocked, locked, completed, in_progress]
 *           default: "all"
 *         description: 关卡状态筛选
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard, expert]
 *         description: 难度筛选
 *       - in: query
 *         name: includeProgress
 *         schema:
 *           type: boolean
 *           default: true
 *         description: 是否包含用户进度信息
 *       - in: query
 *         name: includeRecords
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含成绩记录
 *     responses:
 *       200:
 *         description: 获取关卡列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取关卡列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     gameKey:
 *                       type: string
 *                       example: "math_puzzle"
 *                     gameName:
 *                       type: string
 *                       example: "数学拼图游戏"
 *                     totalLevels:
 *                       type: integer
 *                       example: 30
 *                     completedLevels:
 *                       type: integer
 *                       example: 12
 *                     currentLevel:
 *                       type: integer
 *                       example: 13
 *                     levels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GameLevel'
 *                     progress:
 *                       type: object
 *                       properties:
 *                         completionRate:
 *                           type: number
 *                           format: float
 *                           example: 40.0
 *                         totalStars:
 *                           type: integer
 *                           example: 25
 *                         totalScore:
 *                           type: integer
 *                           example: 12500
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.get('/:gameKey/levels', verifyToken, gameController.getGameLevels);

/**
* @swagger
 * /game/record:
 *   post:
 *     summary: 保存游戏记录
 *     description: 保存用户的游戏记录，包括关卡完成情况、得分、用时、成就等信息。系统会自动更新用户的游戏进度和统计数据。
 *     tags: [游戏管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameKey
 *               - levelId
 *               - action
 *             properties:
 *               gameKey:
 *                 type: string
 *                 pattern: '^[a-zA-Z0-9_-]+$'
 *                 maxLength: 50
 *                 example: "math_puzzle"
 *                 description: 游戏唯一标识键
 *               levelId:
 *                 type: string
 *                 maxLength: 50
 *                 example: "level_01_03"
 *                 description: 关卡ID
 *               action:
 *                 type: string
 *                 enum: [start, complete, pause, quit, save, achievement_unlock]
 *                 example: "complete"
 *                 description: 记录动作类型
 *               score:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 9999999
 *                 example: 1250
 *                 description: 游戏得分
 *               stars:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 3
 *                 description: 星级评分
 *               duration:
 *                 type: integer
 *                 minimum: 0
 *                 example: 185
 *                 description: 游戏时长（秒）
 *               attempts:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *                 description: 尝试次数
 *               data:
 *                 type: object
 *                 properties:
 *                   moves:
 *                     type: integer
 *                     example: 25
 *                   accuracy:
 *                     type: number
 *                     format: float
 *                     minimum: 0
 *                     maximum: 100
 *                     example: 85.5
 *                   bonuses:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["speed_bonus", "perfect_bonus"]
 *                   customStats:
 *                     type: object
 *                     additionalProperties: true
 *                 description: 游戏具体数据
 *               achievements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     achievementId:
 *                       type: string
 *                       example: "first_win"
 *                     name:
 *                       type: string
 *                       example: "首次胜利"
 *                     description:
 *                       type: string
 *                       example: "完成第一个关卡"
 *                     points:
 *                       type: integer
 *                       example: 50
 *                 description: 解锁的成就列表
 *               metadata:
 *                 type: object
 *                 properties:
 *                   deviceInfo:
 *                     type: string
 *                     example: "iPhone 13"
 *                   appVersion:
 *                     type: string
 *                     example: "2.1.0"
 *                   sessionId:
 *                     type: string
 *                     example: "sess_123456"
 *                 description: 元数据信息
 *     responses:
 *       200:
 *         description: 保存游戏记录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "保存游戏记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recordId:
 *                       type: string
 *                       example: "rec_789012"
 *                     gameKey:
 *                       type: string
 *                       example: "math_puzzle"
 *                     levelId:
 *                       type: string
 *                       example: "level_01_03"
 *                     updatedProgress:
 *                       type: object
 *                       properties:
 *                         currentLevel:
 *                           type: integer
 *                           example: 14
 *                         totalScore:
 *                           type: integer
 *                           example: 13750
 *                         newUnlockedLevels:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["level_02_01"]
 *                         nextLevelUnlocked:
 *                           type: boolean
 *                           example: true
 *                     newAchievements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Achievement'
 *                       example: []
 *                     leaderboards:
 *                       type: object
 *                       properties:
 *                         globalRank:
 *                           type: integer
 *                           example: 156
 *                         friendsRank:
 *                           type: integer
 *                           example: 12
 *                         isNewHighScore:
 *                           type: boolean
 *                           example: false
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.post('/record', verifyToken, gameController.saveGameRecord);

/**
* @swagger
 * /game/settings/user:
 *   get:
 *     summary: 获取用户游戏设置
 *     description: 获取当前用户的游戏设置配置，包括音频设置、控制方式、难度偏好、通知设置等个性化配置。
 *     tags: [游戏管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取用户设置成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取用户游戏设置成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "user_12345"
 *                     audio:
 *                       type: object
 *                       properties:
 *                         soundEnabled:
 *                           type: boolean
 *                           example: true
 *                         musicEnabled:
 *                           type: boolean
 *                           example: true
 *                         soundVolume:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 100
 *                           example: 80
 *                         musicVolume:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 100
 *                           example: 60
 *                     controls:
 *                       type: object
 *                       properties:
 *                         controlScheme:
 *                           type: string
 *                           enum: [touch, tilt, joystick, keyboard]
 *                           example: "touch"
 *                         sensitivity:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 100
 *                           example: 70
 *                         invertControls:
 *                           type: boolean
 *                           example: false
 *                     difficulty:
 *                       type: object
 *                       properties:
 *                         defaultDifficulty:
 *                           type: string
 *                           enum: [easy, medium, hard, expert]
 *                           example: "medium"
 *                         adaptiveDifficulty:
 *                           type: boolean
 *                           example: true
 *                         showHints:
 *                           type: boolean
 *                           example: true
 *                     display:
 *                       type: object
 *                       properties:
 *                         graphicsQuality:
 *                           type: string
 *                           enum: [low, medium, high, ultra]
 *                           example: "high"
 *                         frameRate:
 *                           type: integer
 *                           enum: [30, 60, 120]
 *                           example: 60
 *                         fullscreen:
 *                           type: boolean
 *                           example: false
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         achievementAlerts:
 *                           type: boolean
 *                           example: true
 *                         leaderboardUpdates:
 *                           type: boolean
 *                           example: false
 *                         dailyReminders:
 *                           type: boolean
 *                           example: true
 *                     privacy:
 *                       type: object
 *                       properties:
 *                         shareProgress:
 *                           type: boolean
 *                           example: true
 *                         appearInLeaderboard:
 *                           type: boolean
 *                           example: true
 *                         anonymousMode:
 *                           type: boolean
 *                           example: false
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.get('/settings/user', verifyToken, gameController.getUserSettings);

/**
* @swagger
 * /game/settings/user:
 *   put:
 *     summary: 更新用户游戏设置
 *     description: 更新当前用户的游戏设置配置，包括音频、控制、难度、显示、通知等各种个性化设置。
 *     tags: [游戏管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: object
 *                 properties:
 *                   soundEnabled:
 *                     type: boolean
 *                     example: true
 *                   musicEnabled:
 *                     type: boolean
 *                     example: true
 *                   soundVolume:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *                     example: 80
 *                   musicVolume:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *                     example: 60
 *                 description: 音频设置
 *               controls:
 *                 type: object
 *                 properties:
 *                   controlScheme:
 *                     type: string
 *                     enum: [touch, tilt, joystick, keyboard]
 *                     example: "touch"
 *                   sensitivity:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *                     example: 70
 *                   invertControls:
 *                     type: boolean
 *                     example: false
 *                 description: 控制设置
 *               difficulty:
 *                 type: object
 *                 properties:
 *                   defaultDifficulty:
 *                     type: string
 *                     enum: [easy, medium, hard, expert]
 *                     example: "medium"
 *                   adaptiveDifficulty:
 *                     type: boolean
 *                     example: true
 *                   showHints:
 *                     type: boolean
 *                     example: true
 *                 description: 难度设置
 *               display:
 *                 type: object
 *                 properties:
 *                   graphicsQuality:
 *                     type: string
 *                     enum: [low, medium, high, ultra]
 *                     example: "high"
 *                   frameRate:
 *                     type: integer
 *                     enum: [30, 60, 120]
 *                     example: 60
 *                   fullscreen:
 *                     type: boolean
 *                     example: false
 *                 description: 显示设置
 *               notifications:
 *                 type: object
 *                 properties:
 *                   achievementAlerts:
 *                     type: boolean
 *                     example: true
 *                   leaderboardUpdates:
 *                     type: boolean
 *                     example: false
 *                   dailyReminders:
 *                     type: boolean
 *                     example: true
 *                 description: 通知设置
 *               privacy:
 *                 type: object
 *                 properties:
 *                   shareProgress:
 *                     type: boolean
 *                     example: true
 *                   appearInLeaderboard:
 *                     type: boolean
 *                     example: true
 *                   anonymousMode:
 *                     type: boolean
 *                     example: false
 *                 description: 隐私设置
 *     responses:
 *       200:
 *         description: 更新用户设置成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "更新用户游戏设置成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedSettings:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["audio.soundVolume", "difficulty.defaultDifficulty"]
 *                     settings:
 *                       type: object
 *                       description: 更新后的完整设置对象
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:35:00Z"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.put('/settings/user', verifyToken, gameController.updateUserSettings);

/**
* @swagger
 * /game/statistics/user:
 *   get:
 *     summary: 获取用户游戏统计
 *     description: 获取当前用户的游戏统计数据，包括总体统计、各游戏详细统计、成就进度、历史趋势等全面信息。
 *     tags: [游戏管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, today, week, month, year]
 *           default: "all"
 *         description: 统计时间范围
 *       - in: query
 *         name: gameKey
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *         description: 特定游戏键值（可选，用于获取单个游戏的统计）
 *       - in: query
 *         name: includeTrends
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含趋势数据
 *       - in: query
 *         name: includeAchievements
 *         schema:
 *           type: boolean
 *           default: true
 *         description: 是否包含成就统计
 *     responses:
 *       200:
 *         description: 获取用户统计成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取用户游戏统计成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalGamesPlayed:
 *                           type: integer
 *                           example: 15
 *                         totalPlayTime:
 *                           type: integer
 *                           example: 12580
 *                         totalScore:
 *                           type: integer
 *                           example: 45600
 *                         averageScore:
 *                           type: number
 *                           format: float
 *                           example: 3040.0
 *                         completionRate:
 *                           type: number
 *                           format: float
 *                           example: 78.5
 *                         lastPlayedAt:
 *                           type: string
 *                           format: date-time
 *                     gameStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           gameKey:
 *                             type: string
 *                             example: "math_puzzle"
 *                           gameName:
 *                             type: string
 *                             example: "数学拼图"
 *                           playTime:
 *                             type: integer
 *                             example: 3240
 *                           completedLevels:
 *                             type: integer
 *                           example: 12
 *                           totalLevels:
 *                             type: integer
 *                           example: 30
 *                           bestScore:
 *                             type: integer
 *                             example: 2850
 *                           averageScore:
 *                             type: number
 *                             format: float
 *                             example: 1850.5
 *                     achievements:
 *                       type: object
 *                       properties:
 *                         totalAchievements:
 *                           type: integer
 *                           example: 25
 *                         unlockedAchievements:
 *                           type: integer
 *                           example: 18
 *                         achievementProgress:
 *                           type: number
 *                           format: float
 *                           example: 72.0
 *                         recentAchievements:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Achievement'
 *                     trends:
 *                       type: object
 *                       properties:
 *                         dailyActivity:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                               playTime:
 *                                 type: integer
 *                               gamesPlayed:
 *                                 type: integer
 *                         scoreProgression:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                               averageScore:
 *                                 type: number
 *                               bestScore:
 *                                 type: integer
 *                     leaderboards:
 *                       type: object
 *                       properties:
 *                         globalRankings:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               gameKey:
 *                                 type: string
 *                               rank:
 *                                 type: integer
 *                               totalPlayers:
 *                                 type: integer
 *                               percentile:
 *                                 type: number
 *                                 format: float
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.get('/statistics/user', verifyToken, gameController.getGameStatistics);

/**
* @swagger
 * /game/{gameKey}/leaderboard:
 *   get:
 *     summary: 获取游戏排行榜
 *     description: 获取指定游戏的排行榜信息，支持全球排行榜、好友排行榜、历史排行榜等多种排名方式。
 *     tags: [游戏管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameKey
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *           maxLength: 50
 *         description: 游戏唯一标识键
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [global, friends, class, school, weekly, monthly]
 *           default: "global"
 *         description: 排行榜类型
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, week, month, year]
 *           default: "all"
 *         description: 统计周期
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [score, stars, completion_rate, play_time]
 *           default: "score"
 *         description: 排名指标
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 5
 *           maximum: 100
 *           default: 50
 *         description: 返回数量限制
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: 偏移量
 *       - in: query
 *         name: includeSelf
 *         schema:
 *           type: boolean
 *           default: true
 *         description: 是否包含当前用户的排名
 *     responses:
 *       200:
 *         description: 获取排行榜成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取游戏排行榜成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     gameKey:
 *                       type: string
 *                       example: "math_puzzle"
 *                     gameName:
 *                       type: string
 *                       example: "数学拼图游戏"
 *                     leaderboardType:
 *                       type: string
 *                       example: "global"
 *                     period:
 *                       type: string
 *                       example: "all"
 *                     metric:
 *                       type: string
 *                       example: "score"
 *                     totalPlayers:
 *                       type: integer
 *                       example: 15847
 *                     rankings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaderboardEntry'
 *                     userRanking:
 *                       type: object
 *                       properties:
 *                         rank:
 *                           type: integer
 *                           example: 156
 *                         score:
 *                           type: integer
 *                           example: 2850
 *                         percentile:
 *                           type: number
 *                           format: float
 *                           example: 99.0
 *                         nearbyPlayers:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/LeaderboardEntry'
 *                           example: []
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
router.get('/:gameKey/leaderboard', verifyToken, gameController.getLeaderboard);

export default router;

