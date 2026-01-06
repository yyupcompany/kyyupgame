import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

/**
 * 视频处理服务
 * 功能：
 * 1. 检测视频时长
 * 2. 转码视频为720p
 * 3. 验证视频格式
 */
export class VideoProcessingService {
  private readonly MAX_DURATION = 60; // 最大时长60秒
  private readonly TARGET_HEIGHT = 720; // 目标分辨率720p
  private readonly TEMP_DIR = path.join(process.cwd(), 'uploads', 'temp');

  constructor() {
    this.ensureTempDir();
  }

  /**
   * 确保临时目录存在
   */
  private async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.TEMP_DIR, { recursive: true });
    } catch (error) {
      console.error('创建临时目录失败:', error);
    }
  }

  /**
   * 获取视频元数据
   */
  private getVideoMetadata(filePath: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  /**
   * 检测视频时长
   * @param fileBuffer 视频文件缓冲区
   * @returns 视频时长（秒）
   */
  async getVideoDuration(fileBuffer: Buffer): Promise<number> {
    const tempPath = path.join(this.TEMP_DIR, `temp_${Date.now()}.mp4`);
    
    try {
      // 写入临时文件
      await fs.writeFile(tempPath, fileBuffer);
      
      // 获取元数据
      const metadata = await this.getVideoMetadata(tempPath);
      
      const duration = metadata.format.duration || 0;
      
      console.log(`📹 视频时长: ${duration.toFixed(2)}秒`);
      
      return duration;
    } finally {
      // 清理临时文件
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        // 忽略删除错误
      }
    }
  }

  /**
   * 验证视频时长
   * @param fileBuffer 视频文件缓冲区
   * @returns 是否符合时长要求
   */
  async validateVideoDuration(fileBuffer: Buffer): Promise<{
    valid: boolean;
    duration: number;
    message?: string;
  }> {
    try {
      const duration = await this.getVideoDuration(fileBuffer);
      
      if (duration > this.MAX_DURATION) {
        return {
          valid: false,
          duration,
          message: `视频时长${duration.toFixed(1)}秒，超过最大限制${this.MAX_DURATION}秒`
        };
      }
      
      return {
        valid: true,
        duration
      };
    } catch (error) {
      console.error('验证视频时长失败:', error);
      return {
        valid: false,
        duration: 0,
        message: '无法读取视频时长'
      };
    }
  }

  /**
   * 转码视频为720p
   * @param fileBuffer 原始视频文件缓冲区
   * @param originalName 原始文件名
   * @returns 转码后的视频缓冲区
   */
  async transcodeToH720p(
    fileBuffer: Buffer,
    originalName: string
  ): Promise<{
    buffer: Buffer;
    originalSize: number;
    compressedSize: number;
    duration: number;
  }> {
    const inputPath = path.join(this.TEMP_DIR, `input_${Date.now()}_${originalName}`);
    const outputPath = path.join(this.TEMP_DIR, `output_${Date.now()}_720p.mp4`);
    
    try {
      // 写入输入文件
      await fs.writeFile(inputPath, fileBuffer);
      
      console.log(`🎬 开始转码视频: ${originalName}`);
      console.log(`   原始大小: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      
      // 获取原始视频信息
      const metadata = await this.getVideoMetadata(inputPath);
      const duration = metadata.format.duration || 0;
      
      // 执行转码
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-vf scale=-2:720', // 保持宽高比，高度720p
            '-c:v libx264',     // 使用H.264编码
            '-preset fast',     // 快速编码
            '-crf 23',          // 质量控制（18-28，越小质量越好）
            '-c:a aac',         // 音频编码AAC
            '-b:a 128k',        // 音频比特率128k
            '-movflags +faststart' // 优化网络播放
          ])
          .output(outputPath)
          .on('start', (commandLine) => {
            console.log(`   FFmpeg命令: ${commandLine}`);
          })
          .on('progress', (progress) => {
            if (progress.percent) {
              console.log(`   转码进度: ${progress.percent.toFixed(1)}%`);
            }
          })
          .on('end', () => {
            console.log('✅ 视频转码完成');
            resolve();
          })
          .on('error', (err) => {
            console.error('❌ 视频转码失败:', err);
            reject(err);
          })
          .run();
      });
      
      // 读取转码后的文件
      const outputBuffer = await fs.readFile(outputPath);
      
      console.log(`   转码后大小: ${(outputBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   压缩率: ${((1 - outputBuffer.length / fileBuffer.length) * 100).toFixed(1)}%`);
      
      return {
        buffer: outputBuffer,
        originalSize: fileBuffer.length,
        compressedSize: outputBuffer.length,
        duration
      };
    } finally {
      // 清理临时文件
      try {
        await fs.unlink(inputPath);
      } catch (error) {
        // 忽略删除错误
      }
      try {
        await fs.unlink(outputPath);
      } catch (error) {
        // 忽略删除错误
      }
    }
  }

  /**
   * 处理上传的视频
   * 1. 验证时长
   * 2. 转码为720p
   * @param fileBuffer 视频文件缓冲区
   * @param originalName 原始文件名
   * @returns 处理后的视频信息
   */
  async processUploadedVideo(
    fileBuffer: Buffer,
    originalName: string
  ): Promise<{
    success: boolean;
    buffer?: Buffer;
    duration?: number;
    originalSize?: number;
    compressedSize?: number;
    error?: string;
  }> {
    try {
      // 1. 验证时长
      console.log(`📹 处理视频: ${originalName}`);
      const validation = await this.validateVideoDuration(fileBuffer);
      
      if (!validation.valid) {
        return {
          success: false,
          error: validation.message
        };
      }
      
      // 2. 转码为720p
      const result = await this.transcodeToH720p(fileBuffer, originalName);
      
      return {
        success: true,
        buffer: result.buffer,
        duration: result.duration,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize
      };
    } catch (error) {
      console.error('处理视频失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '视频处理失败'
      };
    }
  }

  /**
   * 检查FFmpeg是否可用
   */
  async checkFFmpegAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err, formats) => {
        if (err) {
          console.error('❌ FFmpeg不可用:', err.message);
          resolve(false);
        } else {
          console.log('✅ FFmpeg可用');
          resolve(true);
        }
      });
    });
  }
}

// 导出单例
export const videoProcessingService = new VideoProcessingService();

