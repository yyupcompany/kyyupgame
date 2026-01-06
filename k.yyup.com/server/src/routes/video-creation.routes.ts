import { Router } from 'express';
import { videoCreationController } from '../controllers/video-creation.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
* @swagger
 * components:
 *   schemas:
 *     VideoProject:
 *       type: object
 *       required:
 *         - title
 *         - platform
 *         - videoType
 *         - duration
 *         - style
 *         - topic
 *         - targetAudience
 *         - voiceStyle
 *       properties:
 *         id:
 *           type: integer
 *           description: 项目ID
 *           example: 1
 *         userId:
 *           type: integer
 *           description: 用户ID
 *           example: 1
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: 视频标题
 *           example: "幼儿园春季招生宣传"
 *         description:
 *           type: string
 *           description: 视频描述
 *           example: "展示幼儿园优美的教学环境和师资力量"
 *         platform:
 *           type: string
 *           enum: [douyin, kuaishou, wechat_video, xiaohongshu, bilibili]
 *           description: 目标平台
 *           example: "douyin"
 *         videoType:
 *           type: string
 *           enum: [enrollment, activity, course, environment, teacher, student]
 *           description: 视频类型
 *           example: "enrollment"
 *         duration:
 *           type: integer
 *           minimum: 15
 *           maximum: 300
 *           description: 视频时长（秒）
 *           example: 60
 *         style:
 *           type: string
 *           enum: [warm, professional, lively, elegant]
 *           description: 视频风格
 *           example: "warm"
 *         status:
 *           type: string
 *           enum: [draft, generating_script, generating_audio, generating_video, editing, completed, failed]
 *           description: 项目状态
 *           example: "draft"
 *         topic:
 *           type: string
 *           maxLength: 500
 *           description: 视频主题
 *           example: "春季招生，快乐成长"
 *         keyPoints:
 *           type: string
 *           description: 关键要点
 *           example: "优美环境、专业师资、特色课程"
 *         targetAudience:
 *           type: string
 *           maxLength: 200
 *           description: 目标受众
 *           example: "3-6岁幼儿家长"
 *         voiceStyle:
 *           type: string
 *           maxLength: 100
 *           description: 配音风格
 *           example: "温柔女声"
 *         scriptData:
 *           $ref: '#/components/schemas/VideoScript'
 *           description: 视频脚本数据
 *         audioData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SceneAudio'
 *           description: 音频数据
 *         videoData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SceneVideo'
 *           description: 视频数据
 *         finalVideoUrl:
 *           type: string
 *           format: uri
 *           description: 最终视频URL
 *           example: "https://example.com/videos/final-video-123.mp4"
 *         coverImageUrl:
 *           type: string
 *           format: uri
 *           description: 封面图片URL
 *           example: "https://example.com/images/cover-123.jpg"
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: 生成进度（0-100）
 *           example: 75
 *         progressMessage:
 *           type: string
 *           description: 进度消息
 *           example: "正在生成第3个场景的视频"
 *         errorMessage:
 *           type: string
 *           description: 错误信息
 *           example: "视频生成失败：网络连接超时"
 *         metadata:
 *           type: object
 *           description: 元数据
 *           example: {"generationTime": 120, "cost": 0.5}
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
*
 *     VideoScript:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - totalDuration
 *         - scenes
 *         - bgmSuggestion
 *         - colorTone
 *       properties:
 *         title:
 *           type: string
 *           description: 脚本标题
 *           example: "快乐幼儿园的一天"
 *         description:
 *           type: string
 *           description: 脚本描述
 *           example: "展示幼儿园孩子们快乐学习生活的场景"
 *         totalDuration:
 *           type: integer
 *           minimum: 15
 *           description: 总时长（秒）
 *           example: 60
 *         targetEmotion:
 *           type: string
 *           description: 目标情绪
 *           example: "温馨快乐"
 *         coreMessage:
 *           type: string
 *           description: 核心信息
 *           example: "给孩子一个快乐的童年"
 *         scenes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VideoScene'
 *           minItems: 1
 *           maxItems: 20
 *           description: 视频场景列表
 *         bgmSuggestion:
 *           type: string
 *           description: 背景音乐建议
 *           example: "轻快的儿童音乐"
 *         colorTone:
 *           type: string
 *           description: 色调
 *           example: "明亮温暖"
 *         visualStyle:
 *           type: string
 *           description: 视觉风格
 *           example: "卡通动画风格"
 *         hashtags:
 *           type: array
 *           items:
 *             type: string
 *           description: 标签列表
 *           example: ["幼儿园", "招生", "快乐童年"]
 *         callToAction:
 *           type: string
 *           description: 行动号召
 *           example: "立即报名，给孩子一个快乐的开始"
*
 *     VideoScene:
 *       type: object
 *       required:
 *         - sceneNumber
 *         - duration
 *         - visualDescription
 *         - narration
 *         - cameraAngle
 *         - cameraMovement
 *         - transition
 *       properties:
 *         sceneNumber:
 *           type: integer
 *           minimum: 1
 *           description: 场景编号
 *           example: 1
 *         duration:
 *           type: integer
 *           minimum: 3
 *           maximum: 60
 *           description: 场景时长（秒）
 *           example: 10
 *         sceneTitle:
 *           type: string
 *           description: 场景标题
 *           example: "晨间入园"
 *         visualDescription:
 *           type: string
 *           minLength: 100
 *           maxLength: 500
 *           description: 详细的画面描述（至少100字）
 *           example: "清晨的阳光洒进幼儿园大门，孩子们背着书包，面带微笑地走进校园。老师站在门口迎接每个孩子，温暖的氛围充满了整个画面。镜头慢慢推进，展现孩子们与老师亲切互动的场景。"
 *         narration:
 *           type: string
 *           maxLength: 200
 *           description: 旁白文案
 *           example: "每天清晨，我们都在这里，用温暖的笑容迎接每一位小朋友的到来"
 *         subtitle:
 *           type: string
 *           description: 字幕文本
 *           example: "温暖迎接，快乐启程"
 *         cameraAngle:
 *           type: string
 *           enum: [正面, 侧面, 俯视, 仰视, 特写, 全景, 中景, 近景]
 *           description: 镜头角度
 *           example: "正面"
 *         cameraMovement:
 *           type: string
 *           enum: [固定, 推进, 拉远, 左移, 右移, 上移, 下移, 旋转, 跟拍]
 *           description: 镜头运动
 *           example: "推进"
 *         transition:
 *           type: string
 *           enum: [直接切换, 淡入淡出, 渐变, 擦除, 推拉, 旋转, 缩放]
 *           description: 转场效果
 *           example: "淡入淡出"
 *         emotionalTone:
 *           type: string
 *           description: 情感基调
 *           example: "温馨愉悦"
 *         keyVisualElements:
 *           type: array
 *           items:
 *             type: string
 *           description: 关键视觉元素
 *           example: ["阳光", "笑脸", "彩虹门", "老师挥手"]
*
 *     SceneAudio:
 *       type: object
 *       required:
 *         - sceneNumber
 *         - audioPath
 *         - audioUrl
 *         - duration
 *         - narration
 *       properties:
 *         sceneNumber:
 *           type: integer
 *           minimum: 1
 *           description: 场景编号
 *           example: 1
 *         audioPath:
 *           type: string
 *           description: 音频文件路径
 *           example: "/uploads/audio/scene-1-123.mp3"
 *         audioUrl:
 *           type: string
 *           format: uri
 *           description: 音频访问URL
 *           example: "https://example.com/audio/scene-1-123.mp3"
 *         duration:
 *           type: number
 *           minimum: 1
 *           description: 音频时长（秒）
 *           example: 10.5
 *         narration:
 *           type: string
 *           description: 旁白文本
 *           example: "每天清晨，我们都在这里..."
*
 *     SceneVideo:
 *       type: object
 *       required:
 *         - sceneNumber
 *         - videoPath
 *         - videoUrl
 *         - duration
 *         - taskId
 *         - thumbnailUrl
 *       properties:
 *         sceneNumber:
 *           type: integer
 *           minimum: 1
 *           description: 场景编号
 *           example: 1
 *         videoPath:
 *           type: string
 *           description: 视频文件路径
 *           example: "/uploads/videos/scene-1-456.mp4"
 *         videoUrl:
 *           type: string
 *           format: uri
 *           description: 视频访问URL
 *           example: "https://example.com/videos/scene-1-456.mp4"
 *         duration:
 *           type: number
 *           minimum: 1
 *           description: 视频时长（秒）
 *           example: 10.2
 *         taskId:
 *           type: string
 *           description: AI生成任务ID
 *           example: "task_789xyz"
 *         thumbnailUrl:
 *           type: string
 *           format: uri
 *           description: 缩略图URL
 *           example: "https://example.com/thumbnails/scene-1-456.jpg"
*
 *   parameters:
 *     VideoProjectId:
 *       name: projectId
 *       in: path
 *       required: true
 *       description: 视频项目ID
 *       schema:
 *         type: integer
 *         example: 1
*
 *   responses:
 *     VideoProjectNotFound:
 *       description: 视频项目不存在
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "视频项目不存在"
 *               code:
 *                 type: string
 *                 example: "PROJECT_NOT_FOUND"
 *     ProjectNotReady:
 *       description: 项目状态不允许此操作
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "项目正在生成脚本中，请等待完成"
 *               code:
 *                 type: string
 *                 example: "PROJECT_NOT_READY"
 *     AIQuotaExceeded:
 *       description: AI服务配额不足
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "AI视频生成配额不足"
 *               code:
 *                 type: string
 *                 example: "AI_QUOTA_EXCEEDED"
*
 * tags:
 *   - name: AI视频生成
 *     description: 基于AI的视频创作服务，包括脚本生成、配音合成、场景制作等
*/

// 所有路由都需要认证
router.use(verifyToken);

/**
* @swagger
 * /api/video-creation/projects:
 *   post:
 *     summary: 创建视频项目
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - platform
 *               - videoType
 *               - duration
 *               - style
 *               - topic
 *               - targetAudience
 *               - voiceStyle
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: 视频标题
 *                 example: "幼儿园春季招生宣传"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: 视频描述
 *                 example: "展示幼儿园优美的教学环境和师资力量"
 *               platform:
 *                 type: string
 *                 enum: [douyin, kuaishou, wechat_video, xiaohongshu, bilibili]
 *                 description: 目标平台
 *                 example: "douyin"
 *               videoType:
 *                 type: string
 *                 enum: [enrollment, activity, course, environment, teacher, student]
 *                 description: 视频类型
 *                 example: "enrollment"
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 300
 *                 description: 视频时长（秒）
 *                 example: 60
 *               style:
 *                 type: string
 *                 enum: [warm, professional, lively, elegant]
 *                 description: 视频风格
 *                 example: "warm"
 *               topic:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: 视频主题
 *                 example: "春季招生，快乐成长"
 *               keyPoints:
 *                 type: string
 *                 maxLength: 1000
 *                 description: 关键要点
 *                 example: "优美环境、专业师资、特色课程"
 *               targetAudience:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: 目标受众
 *                 example: "3-6岁幼儿家长"
 *               voiceStyle:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: 配音风格
 *                 example: "温柔女声"
 *     responses:
 *       '201':
 *         description: 视频项目创建成功
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
 *                   example: "视频项目创建成功"
 *                 data:
 *                   $ref: '#/components/schemas/VideoProject'
 *       '400':
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "视频标题不能为空"
 *       '401':
 *         description: 未授权
 *       '402':
 *         $ref: '#/components/responses/AIQuotaExceeded'
*/
router.post(
  '/projects',
  videoCreationController.createProject.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/projects/{projectId}/script:
 *   post:
 *     summary: 生成视频脚本
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/VideoProjectId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customRequirements:
 *                 type: string
 *                 maxLength: 1000
 *                 description: 自定义要求
 *                 example: "重点突出户外活动和艺术教育"
 *               preferredScenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 偏好场景
 *                 example: ["户外活动", "艺术课程", "午餐时间"]
 *               avoidContent:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 避免的内容
 *                 example: ["学习压力", "竞争"]
 *     responses:
 *       '200':
 *         description: 脚本生成成功
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
 *                   example: "脚本生成成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                       example: 1
 *                     scriptData:
 *                       $ref: '#/components/schemas/VideoScript'
 *                     estimatedDuration:
 *                       type: integer
 *                       example: 62
 *       '400':
 *         description: 项目状态不允许生成脚本
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "项目已有脚本，无法重复生成"
 *       '404':
 *         $ref: '#/components/responses/VideoProjectNotFound'
 *       '402':
 *         $ref: '#/components/responses/AIQuotaExceeded'
*/
router.post(
  '/projects/:projectId/script',
  videoCreationController.generateScript.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/projects/{projectId}/audio:
 *   post:
 *     summary: 生成配音
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/VideoProjectId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voiceId:
 *                 type: string
 *                 description: 语音ID（可选，使用默认语音风格）
 *                 example: "zh-CN-XiaoxiaoNeural"
 *               speed:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 2.0
 *                 description: 语速
 *                 default: 1.0
 *                 example: 1.1
 *               pitch:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 description: 音调
 *                 default: medium
 *                 example: "medium"
 *               bgmVolume:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 description: 背景音乐音量
 *                 default: 0.3
 *                 example: 0.3
 *     responses:
 *       '200':
 *         description: 配音生成成功
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
 *                   example: "配音生成成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                       example: 1
 *                     audioData:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SceneAudio'
 *                     totalDuration:
 *                       type: number
 *                       example: 60.5
 *       '400':
 *         description: 项目状态不允许生成配音
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "请先生成视频脚本"
 *       '404':
 *         $ref: '#/components/responses/VideoProjectNotFound'
 *       '402':
 *         $ref: '#/components/responses/AIQuotaExceeded'
*/
router.post(
  '/projects/:projectId/audio',
  videoCreationController.generateAudio.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/projects/{projectId}:
 *   get:
 *     summary: 获取项目详情
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/VideoProjectId'
 *     responses:
 *       '200':
 *         description: 获取项目详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/VideoProject'
 *       '404':
 *         $ref: '#/components/responses/VideoProjectNotFound'
 *       '401':
 *         description: 未授权
*/
router.get(
  '/projects/:projectId',
  videoCreationController.getProject.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/projects:
 *   get:
 *     summary: 获取用户项目列表
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: 页码
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: 每页数量
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - name: status
 *         in: query
 *         required: false
 *         description: 项目状态过滤
 *         schema:
 *           type: string
 *           enum: [draft, generating_script, generating_audio, generating_video, editing, completed, failed]
 *           example: "completed"
 *       - name: videoType
 *         in: query
 *         required: false
 *         description: 视频类型过滤
 *         schema:
 *           type: string
 *           enum: [enrollment, activity, course, environment, teacher, student]
 *           example: "enrollment"
 *       - name: platform
 *         in: query
 *         required: false
 *         description: 平台过滤
 *         schema:
 *           type: string
 *           enum: [douyin, kuaishou, wechat_video, xiaohongshu, bilibili]
 *           example: "douyin"
 *       - name: sortBy
 *         in: query
 *         required: false
 *         description: 排序字段
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, status]
 *           default: createdAt
 *       - name: sortOrder
 *         in: query
 *         required: false
 *         description: 排序方向
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       '200':
 *         description: 获取项目列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/VideoProject'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 25
 *                         statusCounts:
 *                           type: object
 *                           example:
 *                             draft: 3
 *                             generating_script: 2
 *                             generating_video: 4
 *                             completed: 12
 *                             failed: 4
 *       '401':
 *         description: 未授权
*/
router.get(
  '/projects',
  videoCreationController.getUserProjects.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/projects/{projectId}:
 *   delete:
 *     summary: 删除项目
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/VideoProjectId'
 *     responses:
 *       '200':
 *         description: 项目删除成功
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
 *                   example: "项目删除成功"
 *       '400':
 *         description: 项目状态不允许删除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "项目正在生成中，无法删除"
 *       '404':
 *         $ref: '#/components/responses/VideoProjectNotFound'
 *       '401':
 *         description: 未授权
*/
router.delete(
  '/projects/:projectId',
  videoCreationController.deleteProject.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/projects/{projectId}/scenes:
 *   post:
 *     summary: 生成视频分镜
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/VideoProjectId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sceneCount:
 *                 type: integer
 *                 minimum: 3
 *                 maximum: 15
 *                 description: 场景数量
 *                 default: 6
 *                 example: 8
 *               visualStyle:
 *                 type: string
 *                 description: 视觉风格偏好
 *                 example: "卡通动画风格，色彩鲜艳"
 *               quality:
 *                 type: string
 *                 enum: [standard, high, ultra]
 *                 description: 生成质量
 *                 default: high
 *                 example: "high"
 *     responses:
 *       '200':
 *         description: 分镜生成成功
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
 *                   example: "分镜生成成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                       example: 1
 *                     videoData:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SceneVideo'
 *                     estimatedTime:
 *                       type: integer
 *                       description: 预计完成时间（秒）
 *                       example: 180
 *       '400':
 *         description: 项目状态不允许生成分镜
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "请先生成配音"
 *       '404':
 *         $ref: '#/components/responses/VideoProjectNotFound'
 *       '402':
 *         $ref: '#/components/responses/AIQuotaExceeded'
*/
router.post(
  '/projects/:projectId/scenes',
  videoCreationController.generateVideoScenes.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/projects/{projectId}/merge:
 *   post:
 *     summary: 视频剪辑合成
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/VideoProjectId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bgmUrl:
 *                 type: string
 *                 format: uri
 *                 description: 背景音乐URL（可选）
 *                 example: "https://example.com/music/bgm.mp3"
 *               bgmVolume:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 description: 背景音乐音量
 *                 default: 0.3
 *                 example: 0.3
 *               transitions:
 *                 type: string
 *                 enum: [fade, slide, zoom, dissolve]
 *                 description: 转场效果
 *                 default: fade
 *                 example: "fade"
 *               outputFormat:
 *                 type: string
 *                 enum: [mp4, avi, mov]
 *                 description: 输出格式
 *                 default: mp4
 *                 example: "mp4"
 *               resolution:
 *                 type: string
 *                 enum: [720p, 1080p, 4k]
 *                 description: 输出分辨率
 *                 default: 1080p
 *                 example: "1080p"
 *     responses:
 *       '200':
 *         description: 视频合成开始
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
 *                   example: "视频合成已开始，请稍后查看结果"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                       example: 1
 *                     mergeTaskId:
 *                       type: string
 *                       example: "merge_task_123456"
 *                     estimatedTime:
 *                       type: integer
 *                       example: 120
 *       '400':
 *         description: 项目状态不允许合成
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "请先生成所有场景视频"
 *       '404':
 *         $ref: '#/components/responses/VideoProjectNotFound'
 *       '402':
 *         $ref: '#/components/responses/AIQuotaExceeded'
*/
router.post(
  '/projects/:projectId/merge',
  videoCreationController.mergeVideoScenes.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/projects/{projectId}/status:
 *   get:
 *     summary: 获取项目状态（用于轮询）
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/VideoProjectId'
 *     responses:
 *       '200':
 *         description: 获取项目状态成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: "generating_video"
 *                     progress:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                       example: 65
 *                     progressMessage:
 *                       type: string
 *                       example: "正在生成第4个场景的视频"
 *                     currentStep:
 *                       type: string
 *                       example: "video_generation"
 *                     totalSteps:
 *                       type: integer
 *                       example: 5
 *                     completedSteps:
 *                       type: integer
 *                       example: 3
 *                     estimatedTimeRemaining:
 *                       type: integer
 *                       example: 45
 *       '404':
 *         $ref: '#/components/responses/VideoProjectNotFound'
 *       '401':
 *         description: 未授权
*/
router.get(
  '/projects/:projectId/status',
  videoCreationController.getProjectStatus.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/unfinished:
 *   get:
 *     summary: 获取用户的未完成项目列表
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: 返回数量限制
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *           example: 5
 *     responses:
 *       '200':
 *         description: 获取未完成项目列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "幼儿园春季招生"
 *                           status:
 *                             type: string
 *                             example: "generating_video"
 *                           progress:
 *                             type: integer
 *                             example: 65
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T11:45:00Z"
 *                     totalCount:
 *                       type: integer
 *                       example: 3
 *       '401':
 *         description: 未授权
*/
router.get(
  '/unfinished',
  videoCreationController.getUnfinishedProjects.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/projects/{projectId}/notified:
 *   post:
 *     summary: 标记项目为已通知
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/VideoProjectId'
 *     responses:
 *       '200':
 *         description: 标记成功
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
 *                   example: "项目已标记为已通知"
 *       '404':
 *         $ref: '#/components/responses/VideoProjectNotFound'
 *       '401':
 *         description: 未授权
*/
router.post(
  '/projects/:projectId/notified',
  videoCreationController.markAsNotified.bind(videoCreationController)
);

/**
* @swagger
 * /api/video-creation/projects/{projectId}/check-video-status:
 *   post:
 *     summary: 检查视频生成状态（用于轮询）
 *     tags:
 *       - AI视频生成
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/VideoProjectId'
 *     responses:
 *       '200':
 *         description: 检查成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: integer
 *                       example: 1
 *                     hasGeneratedVideo:
 *                       type: boolean
 *                       example: true
 *                     finalVideoUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/videos/final-123.mp4"
 *                     coverImageUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/covers/cover-123.jpg"
 *                     duration:
 *                       type: number
 *                       example: 58.3
 *                     fileSize:
 *                       type: integer
 *                       example: 15728640
 *                     resolution:
 *                       type: string
 *                       example: "1080x1920"
 *                     status:
 *                       type: string
 *                       example: "completed"
 *       '404':
 *         $ref: '#/components/responses/VideoProjectNotFound'
 *       '401':
 *         description: 未授权
*/
router.post(
  '/projects/:projectId/check-video-status',
  videoCreationController.checkVideoStatus.bind(videoCreationController)
);

export default router;

