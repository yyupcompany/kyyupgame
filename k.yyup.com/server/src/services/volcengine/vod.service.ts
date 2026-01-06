import axios from 'axios';
import FormData from 'form-data';
import AIModelConfig from '../../models/ai-model-config.model';

/**
 * 火山引擎视频点播服务
 * 提供视频上传、剪辑、合成等功能
 */
class VolcengineVODService {
  private apiKey: string = '';
  private endpoint: string = '';
  private initialized: boolean = false;

  /**
   * 初始化VOD服务配置
   */
  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 从数据库获取火山引擎配置
      const vodModel = await AIModelConfig.findOne({
        where: {
          provider: 'bytedance_doubao',
          status: 'active'
        }
      });

      if (vodModel) {
        this.apiKey = vodModel.apiKey;
        this.endpoint = vodModel.endpointUrl.replace(/\/chat\/completions.*$/, '');
        this.initialized = true;
        console.log('✅ VOD服务初始化成功');
        console.log('🔗 端点:', this.endpoint);
      } else {
        throw new Error('未找到火山引擎配置');
      }
    } catch (error) {
      console.error('❌ VOD服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 上传视频到VOD
   * @param videoBuffer 视频文件Buffer
   * @param filename 文件名
   * @returns 视频ID和URL
   */
  async uploadVideo(videoBuffer: Buffer, filename: string): Promise<{
    videoId: string;
    videoUrl: string;
    duration: number;
  }> {
    await this.initialize();

    try {
      console.log(`📤 开始上传视频: ${filename}`);

      // 创建FormData
      const formData = new FormData();
      formData.append('file', videoBuffer, {
        filename,
        contentType: 'video/mp4'
      });

      // 上传到火山引擎VOD
      const response = await axios.post(
        `${this.endpoint}/vod/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 300000, // 5分钟超时
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      console.log('✅ 视频上传成功');
      
      return {
        videoId: response.data.video_id || response.data.id,
        videoUrl: response.data.video_url || response.data.url,
        duration: response.data.duration || 0
      };
    } catch (error: any) {
      console.error('❌ 视频上传失败:', error);
      throw new Error(`视频上传失败: ${error.message}`);
    }
  }

  /**
   * 合并多个视频片段
   * @param videoUrls 视频URL数组
   * @param outputFilename 输出文件名
   * @returns 合并后的视频信息
   */
  async mergeVideos(videoUrls: string[], outputFilename: string): Promise<{
    videoId: string;
    videoUrl: string;
    duration: number;
  }> {
    await this.initialize();

    try {
      console.log(`✂️ 开始合并 ${videoUrls.length} 个视频片段`);

      const response = await axios.post(
        `${this.endpoint}/vod/merge`,
        {
          video_urls: videoUrls,
          output_filename: outputFilename,
          format: 'mp4'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 600000 // 10分钟超时
        }
      );

      console.log('✅ 视频合并成功');

      return {
        videoId: response.data.video_id || response.data.id,
        videoUrl: response.data.video_url || response.data.url,
        duration: response.data.duration || 0
      };
    } catch (error: any) {
      console.error('❌ 视频合并失败:', error);
      throw new Error(`视频合并失败: ${error.message}`);
    }
  }

  /**
   * 为视频添加音频
   * @param videoUrl 视频URL
   * @param audioUrl 音频URL
   * @param outputFilename 输出文件名
   * @returns 合成后的视频信息
   */
  async addAudioToVideo(
    videoUrl: string,
    audioUrl: string,
    outputFilename: string
  ): Promise<{
    videoId: string;
    videoUrl: string;
    duration: number;
  }> {
    await this.initialize();

    try {
      console.log('🎤 开始为视频添加音频');

      const response = await axios.post(
        `${this.endpoint}/vod/add-audio`,
        {
          video_url: videoUrl,
          audio_url: audioUrl,
          output_filename: outputFilename,
          audio_volume: 1.0,
          video_volume: 0.3 // 降低原视频音量
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 600000
        }
      );

      console.log('✅ 音频添加成功');

      return {
        videoId: response.data.video_id || response.data.id,
        videoUrl: response.data.video_url || response.data.url,
        duration: response.data.duration || 0
      };
    } catch (error: any) {
      console.error('❌ 音频添加失败:', error);
      throw new Error(`音频添加失败: ${error.message}`);
    }
  }

  /**
   * 视频转码
   * @param videoUrl 视频URL
   * @param format 目标格式
   * @param quality 质量设置
   * @returns 转码后的视频信息
   */
  async transcodeVideo(
    videoUrl: string,
    format: string = 'mp4',
    quality: 'low' | 'medium' | 'high' = 'high'
  ): Promise<{
    videoId: string;
    videoUrl: string;
    duration: number;
  }> {
    await this.initialize();

    try {
      console.log(`🔄 开始视频转码: ${format}, 质量: ${quality}`);

      const response = await axios.post(
        `${this.endpoint}/vod/transcode`,
        {
          video_url: videoUrl,
          format,
          quality,
          bitrate: quality === 'high' ? '5000k' : quality === 'medium' ? '2000k' : '1000k'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 600000
        }
      );

      console.log('✅ 视频转码成功');

      return {
        videoId: response.data.video_id || response.data.id,
        videoUrl: response.data.video_url || response.data.url,
        duration: response.data.duration || 0
      };
    } catch (error: any) {
      console.error('❌ 视频转码失败:', error);
      throw new Error(`视频转码失败: ${error.message}`);
    }
  }

  /**
   * 查询视频处理状态
   * @param taskId 任务ID
   * @returns 任务状态信息
   */
  async getTaskStatus(taskId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: any;
    error?: string;
  }> {
    await this.initialize();

    try {
      const response = await axios.get(
        `${this.endpoint}/vod/task/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 30000
        }
      );

      return {
        status: response.data.status,
        progress: response.data.progress || 0,
        result: response.data.result,
        error: response.data.error
      };
    } catch (error: any) {
      console.error('❌ 查询任务状态失败:', error);
      throw new Error(`查询任务状态失败: ${error.message}`);
    }
  }
}

export const vodService = new VolcengineVODService();
export default vodService;

