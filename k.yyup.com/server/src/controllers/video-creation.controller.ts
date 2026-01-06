import { Request, Response } from 'express';
import { videoScriptService } from '../services/ai/video-script.service';
import { videoAudioService } from '../services/ai/video-audio.service';
import { videoService } from '../services/ai/video.service';
import { aiBridgeService } from '../services/ai/bridge/ai-bridge.service';
import VideoProject, { VideoProjectStatus } from '../models/video-project.model';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 视频制作控制器
 */
export class VideoCreationController {
  /**
   * 创建视频项目
   */
  async createProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权',
        });
      }

      const {
        title,
        platform,
        videoType,
        duration,
        style,
        topic,
        keyPoints,
        targetAudience,
        voiceStyle,
      } = req.body;

      // 验证必填字段
      if (!topic || !platform || !videoType) {
        return res.status(400).json({
          success: false,
          message: '缺少必填字段：topic, platform, videoType',
        });
      }

      // 创建项目记录
      const project = await VideoProject.create({
        userId,
        title: title || topic,
        description: keyPoints,
        platform,
        videoType,
        duration: duration || 30,
        style: style || 'warm',
        status: VideoProjectStatus.DRAFT,
        topic,
        keyPoints,
        targetAudience: targetAudience || 'parents',
        voiceStyle: voiceStyle || 'alloy',
      });

      console.log(`✅ 视频项目创建成功: ${project.id}`);

      res.json({
        success: true,
        data: {
          projectId: project.id,
          status: project.status,
          title: project.title,
        },
        message: '项目创建成功',
      });
    } catch (error: any) {
      console.error('❌ 创建视频项目失败:', error);
      res.status(500).json({
        success: false,
        message: '创建视频项目失败',
        error: error.message,
      });
    }
  }

  /**
   * 生成视频脚本
   */
  async generateScript(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;

      // 从请求体中获取参数（如果提供）
      const {
        topic,
        duration,
        style,
        videoType,
        keyPoints,
        targetAudience,
        platform
      } = req.body;

      // 获取项目
      const project = await VideoProject.findByPk(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在',
        });
      }

      // 验证权限
      if (project.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权限访问此项目',
        });
      }

      // 使用请求体中的参数（如果提供），否则使用项目中的参数
      const scriptOptions = {
        topic: topic || project.topic,
        duration: duration !== undefined ? duration : project.duration,
        style: style || project.style || 'warm', // 默认温馨风格
        videoType: videoType || project.videoType,
        keyPoints: keyPoints || project.keyPoints || undefined,
        targetAudience: targetAudience || project.targetAudience || 'parents', // 默认家长
        platform: platform || project.platform,
      };

      // 验证必填字段
      if (!scriptOptions.topic || !scriptOptions.platform || !scriptOptions.videoType) {
        return res.status(400).json({
          success: false,
          message: '缺少必填字段：topic, platform, videoType',
        });
      }

      // 验证字段不能为空字符串
      if (scriptOptions.topic.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '主题不能为空',
        });
      }

      // 更新项目状态和进度
      await project.update({
        status: VideoProjectStatus.GENERATING_SCRIPT,
        progress: 10,
        progressMessage: '正在准备生成脚本...'
      });

      console.log(`📝 开始为项目${projectId}生成脚本...`);
      console.log(`📊 项目参数: 主题=${scriptOptions.topic}, 时长=${scriptOptions.duration}秒, 风格=${scriptOptions.style}`);
      console.log(`📊 请求体duration: ${duration}, 项目duration: ${project.duration}, 最终duration: ${scriptOptions.duration}`);

      // 更新进度：开始调用AI
      await project.update({
        progress: 20,
        progressMessage: '正在调用AI模型生成脚本...'
      });

      try {
        // 生成脚本（这可能需要较长时间）
        const script = await videoScriptService.generateScript(
          scriptOptions,
          userId
        );

        console.log(`✅ AI脚本生成成功，开始保存...`);

        // 更新进度：脚本生成完成
        await project.update({
          progress: 90,
          progressMessage: '正在保存脚本数据...'
        });

        // 保存脚本数据
        await project.update({
          scriptData: script,
          status: VideoProjectStatus.DRAFT,
          title: script.title, // 使用AI生成的标题
          progress: 100,
          progressMessage: '脚本生成完成',
          completedAt: new Date(),
        });

        console.log(`✅ 项目${projectId}脚本生成成功`);

        res.json({
          success: true,
          data: script,
          message: '脚本生成成功',
        });

      } catch (scriptError: any) {
        console.error('❌ AI脚本生成失败:', scriptError);

        // 更新项目状态为失败
        await project.update({
          status: VideoProjectStatus.FAILED,
          progress: 0,
          progressMessage: `脚本生成失败: ${scriptError.message || '未知错误'}`,
          errorMessage: scriptError.message
        });

        throw scriptError;
      }

    } catch (error: any) {
      console.error('❌ 生成脚本失败:', error);

      // 更新项目状态为失败
      const { projectId } = req.params;
      await VideoProject.update(
        {
          status: VideoProjectStatus.FAILED,
          errorMessage: error.message,
        },
        { where: { id: projectId } }
      );

      res.status(500).json({
        success: false,
        message: '生成脚本失败',
        error: error.message,
      });
    }
  }

  /**
   * 生成配音
   */
  async generateAudio(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;

      // 获取项目
      const project = await VideoProject.findByPk(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在',
        });
      }

      // 验证权限
      if (project.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权限访问此项目',
        });
      }

      // 验证脚本数据
      if (!project.scriptData || !project.scriptData.scenes) {
        return res.status(400).json({
          success: false,
          message: '请先生成脚本',
        });
      }

      // 1️⃣ 清理数据库中的旧配音数据
      console.log(`🗑️ 清理项目${projectId}的旧配音数据...`);
      await project.update({
        audioData: null,
        status: VideoProjectStatus.GENERATING_AUDIO
      });

      console.log(`🎤 开始为项目${projectId}生成配音...`);

      // 2️⃣ 生成配音（会自动清理旧的物理文件）
      const audioFiles = await videoAudioService.generateSceneAudio(
        project.scriptData.scenes,
        projectId,
        project.voiceStyle
      );

      // 3️⃣ 保存新的配音数据
      await project.update({
        audioData: audioFiles,
        status: VideoProjectStatus.DRAFT,
        errorMessage: null, // 清除之前的错误信息
      });

      console.log(`✅ 项目${projectId}配音生成成功`);

      res.json({
        success: true,
        data: audioFiles,
        message: '配音生成成功',
      });
    } catch (error: any) {
      console.error('❌ 生成配音失败:', error);

      // 4️⃣ 更新项目状态为失败，清空配音数据
      const { projectId } = req.params;
      await VideoProject.update(
        {
          status: VideoProjectStatus.FAILED,
          errorMessage: error.message,
          audioData: null, // 清空失败的配音数据
        },
        { where: { id: projectId } }
      );

      res.status(500).json({
        success: false,
        message: '生成配音失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取项目详情
   */
  async getProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;

      const project = await VideoProject.findByPk(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在',
        });
      }

      // 验证权限
      if (project.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权限访问此项目',
        });
      }

      res.json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      console.error('❌ 获取项目详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取项目详情失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取用户的所有项目
   */
  async getUserProjects(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { page = 1, pageSize = 10, status } = req.query;

      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const { count, rows } = await VideoProject.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
      });

      res.json({
        success: true,
        data: {
          items: rows,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize),
        },
      });
    } catch (error: any) {
      console.error('❌ 获取用户项目列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取项目列表失败',
        error: error.message,
      });
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;

      const project = await VideoProject.findByPk(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在',
        });
      }

      // 验证权限
      if (project.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权限删除此项目',
        });
      }

      // 删除相关文件
      try {
        // 删除音频文件
        if (project.audioData) {
          await videoAudioService.deleteProjectAudio(projectId);
        }

        // 删除视频文件
        await this.deleteProjectVideos(project);
      } catch (fileError: any) {
        console.error('⚠️ 删除文件时出错（继续删除项目）:', fileError.message);
        // 即使文件删除失败，也继续删除数据库记录
      }

      // 删除项目
      await project.destroy();

      console.log(`✅ 项目${projectId}已删除（包括所有相关文件）`);

      res.json({
        success: true,
        message: '项目删除成功',
      });
    } catch (error: any) {
      console.error('❌ 删除项目失败:', error);
      res.status(500).json({
        success: false,
        message: '删除项目失败',
        error: error.message,
      });
    }
  }

  /**
   * 生成视频分镜（步骤4）
   */
  async generateVideoScenes(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;
      const { scenes } = req.body; // 脚本中的场景列表

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权',
        });
      }

      // 查找项目
      const project = await VideoProject.findOne({
        where: { id: projectId, userId },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在',
        });
      }

      console.log(`🎬 开始生成视频分镜: 项目${projectId}, ${scenes.length}个场景`);

      // 更新项目状态
      await project.update({ status: VideoProjectStatus.GENERATING_VIDEO });

      // 为每个场景生成视频
      const sceneVideos = [];
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        console.log(`🎬 生成场景${i + 1}/${scenes.length}: ${scene.title}`);

        try {
          // 调用视频生成服务
          // 优先使用 visualDescription，其次是 visual 或 description
          const prompt = scene.visualDescription || scene.visual || scene.description || scene.sceneTitle || '视频场景';

          console.log(`🎬 场景${i + 1} prompt: ${prompt.substring(0, 50)}...`);

          const videoResult = await videoService.generateVideoFromText(userId, {
            prompt: prompt,
            duration: scene.duration || 5,
            size: '1280x720',
            fps: 30,
            quality: 'standard',
            style: 'natural'
          });

          sceneVideos.push({
            sceneIndex: i,
            sceneTitle: scene.title,
            videoUrl: videoResult.data[0]?.url,
            taskId: videoResult.data[0]?.taskId,
            duration: scene.duration || 5
          });
        } catch (error) {
          console.error(`❌ 场景${i + 1}生成失败:`, error);
          sceneVideos.push({
            sceneIndex: i,
            sceneTitle: scene.title,
            error: error instanceof Error ? error.message : '生成失败'
          });
        }
      }

      // 保存场景视频信息到项目
      await project.update({
        sceneVideos: JSON.stringify(sceneVideos)
      });

      console.log(`✅ 视频分镜生成完成: ${sceneVideos.length}个场景`);

      res.json({
        success: true,
        message: '视频分镜生成完成',
        data: {
          projectId: project.id,
          sceneVideos,
          totalScenes: scenes.length,
          successCount: sceneVideos.filter(v => v.videoUrl).length
        },
      });
    } catch (error: any) {
      console.error('❌ 生成视频分镜失败:', error);
      res.status(500).json({
        success: false,
        message: '生成视频分镜失败',
        error: error.message,
      });
    }
  }

  /**
   * 视频剪辑合成（步骤5）
   */
  async mergeVideoScenes(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;
      const { sceneVideos, audioUrl, audioData } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权',
        });
      }

      // 查找项目
      const project = await VideoProject.findOne({
        where: { id: projectId, userId },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在',
        });
      }

      console.log(`✂️ 开始视频剪辑合成: 项目${projectId}`);
      console.log(`📊 场景数: ${sceneVideos?.length || 0}, 音频数: ${audioData?.length || 0}`);

      // 更新项目状态
      await project.update({ status: VideoProjectStatus.EDITING });

      // 提取视频URL列表
      const videoUrls = sceneVideos
        .filter((scene: any) => scene.videoUrl)
        .map((scene: any) => scene.videoUrl);

      if (videoUrls.length === 0) {
        throw new Error('没有可用的视频片段');
      }

      // 步骤1: 合并视频片段（通过AI Bridge统一调用）
      console.log(`✂️ 合并${videoUrls.length}个视频片段...`);
      const mergedVideo = await aiBridgeService.mergeVideosVOD({
        videoUrls,
        outputFilename: `${project.title}_merged.mp4`
      });

      // 步骤2: 添加配音（如果有）（通过AI Bridge统一调用）
      let finalVideo = mergedVideo;

      // 优先使用 audioData 数组，如果没有则使用 audioUrl
      const audioToUse = audioData && audioData.length > 0
        ? audioData[0].audioUrl  // 使用第一个音频（或者可以合并所有音频）
        : audioUrl;

      if (audioToUse) {
        console.log('🎤 添加配音...');
        finalVideo = await aiBridgeService.addAudioToVideoVOD({
          videoUrl: mergedVideo.videoUrl,
          audioUrl: audioToUse,
          outputFilename: `${project.title}_final.mp4`
        });
      } else {
        console.log('⚠️ 没有配音数据，跳过配音步骤');
      }

      // 步骤3: 转码优化（通过AI Bridge统一调用）
      console.log('🔄 视频转码优化...');
      const optimizedVideo = await aiBridgeService.transcodeVideoVOD({
        videoUrl: finalVideo.videoUrl,
        format: 'mp4',
        quality: 'high'
      });

      // 更新项目
      await project.update({
        status: VideoProjectStatus.COMPLETED,
        finalVideoUrl: optimizedVideo.videoUrl,
        finalVideoId: optimizedVideo.videoId,
        duration: optimizedVideo.duration
      });

      console.log(`✅ 视频剪辑合成完成: ${optimizedVideo.videoUrl}`);

      res.json({
        success: true,
        message: '视频剪辑合成完成',
        data: {
          projectId: project.id,
          videoUrl: optimizedVideo.videoUrl,
          videoId: optimizedVideo.videoId,
          duration: optimizedVideo.duration
        },
      });
    } catch (error: any) {
      console.error('❌ 视频剪辑合成失败:', error);

      // 更新项目状态为失败
      const { projectId } = req.params;
      await VideoProject.update(
        { status: VideoProjectStatus.FAILED },
        { where: { id: projectId } }
      );

      res.status(500).json({
        success: false,
        message: '视频剪辑合成失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取项目状态（用于轮询）
   */
  async getProjectStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权',
          data: null,
        });
      }

      // 验证 projectId
      if (!projectId || projectId === 'undefined' || projectId === 'null') {
        return res.status(400).json({
          success: false,
          message: 'projectId 无效',
          data: null,
        });
      }

      // 查询项目
      const project = await VideoProject.findByPk(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在',
          data: null,
        });
      }

      // 验证权限
      if (project.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权限访问此项目',
          data: null,
        });
      }

      // 返回项目状态
      res.json({
        success: true,
        data: {
          id: project.id,
          status: project.status,
          progress: project.progress,
          progressMessage: project.progressMessage,
          title: project.title,
          completedAt: project.completedAt,
          errorMessage: project.errorMessage,
          scriptData: project.scriptData,
          audioData: project.audioData,
          videoData: project.videoData,
          finalVideoUrl: project.finalVideoUrl,
        },
      });
    } catch (error: any) {
      console.error('❌ 获取项目状态失败:', error);
      res.status(500).json({
        success: false,
        message: '获取项目状态失败',
        data: null, // 即使出错也返回null，防止前端undefined错误
        error: error.message,
      });
    }
  }

  /**
   * 获取用户的未完成项目列表（用于恢复）
   */
  async getUnfinishedProjects(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权',
          data: [], // 即使失败也返回空数组
        });
      }

      // 查询未完成的项目
      const projects = await VideoProject.findAll({
        where: {
          userId,
          status: [
            VideoProjectStatus.DRAFT,
            VideoProjectStatus.GENERATING_SCRIPT,
            VideoProjectStatus.GENERATING_AUDIO,
            VideoProjectStatus.GENERATING_VIDEO,
            VideoProjectStatus.EDITING,
          ],
        },
        order: [['updatedAt', 'DESC']],
        limit: 10,
      });

      // 过滤掉没有实际内容的空 DRAFT 项目，并自动删除它们
      const validProjects = [];
      const emptyProjects = [];
      
      for (const p of projects) {
        // 如果是 DRAFT 状态，检查是否有实际内容
        if (p.status === VideoProjectStatus.DRAFT) {
          let hasContent = false;
          
          if (p.scriptData) {
            if (typeof p.scriptData === 'object') {
              hasContent = Object.keys(p.scriptData as any).length > 0;
            } else if (typeof p.scriptData === 'string') {
              hasContent = (p.scriptData as string).trim() !== '' && p.scriptData !== '{}';
            }
          }
          
          if (hasContent) {
            validProjects.push(p);
          } else {
            // 检查创建时间，超过30分钟的空项目自动删除
            const createdAt = new Date(p.createdAt);
            const now = new Date();
            const minutesOld = (now.getTime() - createdAt.getTime()) / (1000 * 60);
            
            if (minutesOld > 30) {
              emptyProjects.push(p);
              console.log(`🗑️ 发现超过30分钟的空DRAFT项目: ${p.id}，将自动删除`);
            } else {
              // 新创建的空项目，暂时保留
              validProjects.push(p);
            }
          }
        } else {
          // 其他状态（正在生成中）都算有效
          validProjects.push(p);
        }
      }

      // 异步删除空项目（不阻塞响应）
      if (emptyProjects.length > 0) {
        Promise.all(emptyProjects.map(async (p) => {
          try {
            // 删除音频文件
            if (p.audioData) {
              await videoAudioService.deleteProjectAudio(String(p.id));
            }
            // 删除视频文件
            await this.deleteProjectVideos(p);
            // 删除数据库记录
            await p.destroy();
            console.log(`✅ 自动清理空项目: ${p.id}`);
          } catch (error: any) {
            console.error(`❌ 清理空项目${p.id}失败:`, error.message);
          }
        }));
      }

      res.json({
        success: true,
        data: validProjects.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          progress: p.progress,
          progressMessage: p.progressMessage,
          scriptData: p.scriptData, // 添加脚本数据，用于恢复
          audioData: p.audioData, // 添加配音数据，用于恢复
          sceneVideos: p.sceneVideos, // 添加分镜数据，用于恢复
          // 添加表单字段，用于恢复表单数据
          topic: p.topic,
          platform: p.platform,
          videoType: p.videoType,
          duration: p.duration,
          keyPoints: p.keyPoints,
          voiceStyle: p.voiceStyle, // 添加音色风格
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      });
    } catch (error: any) {
      console.error('❌ 获取未完成项目失败:', error);
      res.status(500).json({
        success: false,
        message: '获取未完成项目失败',
        data: [], // 即使出错也返回空数组，防止前端undefined错误
        error: error.message,
      });
    }
  }

  /**
   * 检查视频生成状态（专门用于轮询）
   */
  async checkVideoStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权',
          data: null,
        });
      }

      // 验证 projectId
      if (!projectId || projectId === 'undefined' || projectId === 'null') {
        return res.status(400).json({
          success: false,
          message: 'projectId 无效',
          data: null,
        });
      }

      // 查询项目
      const project = await VideoProject.findByPk(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在',
          data: null,
        });
      }

      // 验证权限
      if (project.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权限访问此项目',
          data: null,
        });
      }

      // 解析 sceneVideos
      let sceneVideos: any[] = [];
      if (project.sceneVideos) {
        if (typeof project.sceneVideos === 'string') {
          try {
            sceneVideos = JSON.parse(project.sceneVideos);
          } catch (e) {
            console.error('解析 sceneVideos 失败:', e);
            sceneVideos = [];
          }
        } else if (Array.isArray(project.sceneVideos)) {
          sceneVideos = project.sceneVideos;
        }
      }

      // 检查是否全部完成
      const allCompleted = sceneVideos.length > 0 && sceneVideos.every((scene: any) => scene.videoUrl);
      
      // 检查是否有错误
      const hasError = sceneVideos.some((scene: any) => scene.error);

      // 返回视频生成状态
      res.json({
        success: true,
        data: {
          allCompleted,
          hasError,
          sceneVideos,
        },
      });
    } catch (error: any) {
      console.error('❌ 检查视频状态失败:', error);
      res.status(500).json({
        success: false,
        message: '检查视频状态失败',
        data: {
          allCompleted: false,
          hasError: true,
          sceneVideos: [],
        },
        error: error.message,
      });
    }
  }

  /**
   * 标记项目为已通知
   */
  async markAsNotified(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权',
        });
      }

      // 查询项目
      const project = await VideoProject.findByPk(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在',
        });
      }

      // 验证权限
      if (project.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权限访问此项目',
        });
      }

      // 标记为已通知
      await project.update({ notified: true });

      res.json({
        success: true,
        message: '标记成功',
      });
    } catch (error: any) {
      console.error('❌ 标记通知失败:', error);
      res.status(500).json({
        success: false,
        message: '标记通知失败',
        error: error.message,
      });
    }
  }

  /**
   * 删除项目的视频文件（私有方法）
   * 安全删除：只删除uploads目录下、以项目ID命名的文件
   */
  private async deleteProjectVideos(project: VideoProject): Promise<void> {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const videoDir = path.join(uploadsDir, 'video-scenes');
    const finalVideoDir = path.join(uploadsDir, 'final-videos');

    try {
      // 删除场景视频文件
      if (project.sceneVideos) {
        let sceneVideos: any[] = [];
        
        // 解析 sceneVideos
        if (typeof project.sceneVideos === 'string') {
          try {
            sceneVideos = JSON.parse(project.sceneVideos);
          } catch (e) {
            sceneVideos = [];
          }
        } else if (Array.isArray(project.sceneVideos)) {
          sceneVideos = project.sceneVideos;
        }

        // 删除每个场景的视频文件
        for (const scene of sceneVideos) {
          if (scene.videoPath) {
            try {
              // 安全检查：确保路径在 uploads 目录内
              const fullPath = path.resolve(scene.videoPath);
              const uploadsPath = path.resolve(uploadsDir);
              
              if (fullPath.startsWith(uploadsPath) && fs.existsSync(fullPath)) {
                await fs.promises.unlink(fullPath);
                console.log(`🗑️ 删除场景视频文件: ${path.basename(fullPath)}`);
              } else {
                console.warn(`⚠️ 跳过不安全的路径: ${scene.videoPath}`);
              }
            } catch (error: any) {
              console.error(`❌ 删除场景视频失败: ${scene.videoPath}`, error.message);
            }
          }
        }
      }

      // 删除最终合成视频文件
      if (project.finalVideoPath) {
        try {
          const fullPath = path.resolve(project.finalVideoPath);
          const uploadsPath = path.resolve(uploadsDir);
          
          if (fullPath.startsWith(uploadsPath) && fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
            console.log(`🗑️ 删除最终视频文件: ${path.basename(fullPath)}`);
          } else {
            console.warn(`⚠️ 跳过不安全的路径: ${project.finalVideoPath}`);
          }
        } catch (error: any) {
          console.error(`❌ 删除最终视频失败: ${project.finalVideoPath}`, error.message);
        }
      }

      // 批量删除以项目ID命名的文件（双重保险）
      const projectIdStr = String(project.id);
      const directories = [videoDir, finalVideoDir];
      
      for (const dir of directories) {
        try {
          if (fs.existsSync(dir)) {
            const files = await fs.promises.readdir(dir);
            const projectFiles = files.filter(file => 
              file.includes(`_${projectIdStr}_`) || file.startsWith(`${projectIdStr}_`)
            );

            for (const file of projectFiles) {
              const filePath = path.join(dir, file);
              
              // 再次安全检查
              const fullPath = path.resolve(filePath);
              const uploadsPath = path.resolve(uploadsDir);
              
              if (fullPath.startsWith(uploadsPath) && fs.existsSync(fullPath)) {
                await fs.promises.unlink(fullPath);
                console.log(`🗑️ 删除视频文件: ${file}`);
              }
            }
          }
        } catch (error: any) {
          console.error(`❌ 清理目录${dir}失败:`, error.message);
        }
      }

      console.log(`✅ 项目${projectIdStr}的所有视频文件已清理`);
    } catch (error: any) {
      console.error('❌ 删除视频文件失败:', error);
      // 不抛出错误，继续删除数据库记录
    }
  }
}

export const videoCreationController = new VideoCreationController();

