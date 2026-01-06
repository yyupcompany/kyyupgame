/**
 * 图片压缩服务
 * 用于在发送给AI模型前压缩图片，减少token消耗
 */

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

export interface ImageCompressionOptions {
  /**
   * 最大宽度（像素）
   * @default 1024
   */
  maxWidth?: number;

  /**
   * 最大高度（像素）
   * @default 1024
   */
  maxHeight?: number;

  /**
   * 图片质量（1-100）
   * @default 80
   */
  quality?: number;

  /**
   * 输出格式
   * @default 'jpeg'
   */
  format?: 'jpeg' | 'png' | 'webp';

  /**
   * 是否保持原始宽高比
   * @default true
   */
  preserveAspectRatio?: boolean;
}

export interface ImageCompressionResult {
  /**
   * 压缩后的图片Buffer
   */
  buffer: Buffer;

  /**
   * 压缩后的图片base64
   */
  base64: string;

  /**
   * 原始文件大小（字节）
   */
  originalSize: number;

  /**
   * 压缩后文件大小（字节）
   */
  compressedSize: number;

  /**
   * 压缩率（百分比）
   */
  compressionRatio: number;

  /**
   * 图片宽度
   */
  width: number;

  /**
   * 图片高度
   */
  height: number;

  /**
   * 输出格式
   */
  format: string;
}

class ImageCompressionService {
  /**
   * 默认压缩选项
   */
  private defaultOptions: Required<ImageCompressionOptions> = {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 80,
    format: 'jpeg',
    preserveAspectRatio: true
  };

  /**
   * 压缩图片文件
   * @param filePath 图片文件路径
   * @param options 压缩选项
   * @returns 压缩结果
   */
  async compressImageFile(
    filePath: string,
    options?: ImageCompressionOptions
  ): Promise<ImageCompressionResult> {
    try {
      // 读取原始文件
      const originalBuffer = await readFileAsync(filePath);
      const originalSize = originalBuffer.length;

      // 压缩图片
      const result = await this.compressImageBuffer(originalBuffer, options);

      return {
        ...result,
        originalSize
      };
    } catch (error) {
      console.error('图片压缩失败:', error);
      throw new Error(`图片压缩失败: ${(error as Error).message}`);
    }
  }

  /**
   * 压缩图片Buffer
   * @param buffer 图片Buffer
   * @param options 压缩选项
   * @returns 压缩结果
   */
  async compressImageBuffer(
    buffer: Buffer,
    options?: ImageCompressionOptions
  ): Promise<ImageCompressionResult> {
    try {
      const opts = { ...this.defaultOptions, ...options };
      const originalSize = buffer.length;

      // 获取图片元数据
      const metadata = await sharp(buffer).metadata();
      const originalWidth = metadata.width || 0;
      const originalHeight = metadata.height || 0;

      // 计算目标尺寸
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;

      if (opts.preserveAspectRatio) {
        // 保持宽高比
        if (originalWidth > opts.maxWidth || originalHeight > opts.maxHeight) {
          const widthRatio = opts.maxWidth / originalWidth;
          const heightRatio = opts.maxHeight / originalHeight;
          const ratio = Math.min(widthRatio, heightRatio);

          targetWidth = Math.round(originalWidth * ratio);
          targetHeight = Math.round(originalHeight * ratio);
        }
      } else {
        // 不保持宽高比
        targetWidth = Math.min(originalWidth, opts.maxWidth);
        targetHeight = Math.min(originalHeight, opts.maxHeight);
      }

      // 压缩图片
      let sharpInstance = sharp(buffer)
        .resize(targetWidth, targetHeight, {
          fit: opts.preserveAspectRatio ? 'inside' : 'fill',
          withoutEnlargement: true
        });

      // 根据格式设置压缩选项
      switch (opts.format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({
            quality: opts.quality,
            progressive: true,
            mozjpeg: true
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({
            quality: opts.quality,
            compressionLevel: 9,
            progressive: true
          });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({
            quality: opts.quality,
            effort: 6
          });
          break;
      }

      // 执行压缩
      const compressedBuffer = await sharpInstance.toBuffer();
      const compressedSize = compressedBuffer.length;

      // 计算压缩率
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      // 转换为base64
      const base64 = compressedBuffer.toString('base64');
      const base64WithPrefix = `data:image/${opts.format};base64,${base64}`;

      console.log(`✅ 图片压缩成功:`);
      console.log(`   原始尺寸: ${originalWidth}x${originalHeight}`);
      console.log(`   压缩尺寸: ${targetWidth}x${targetHeight}`);
      console.log(`   原始大小: ${(originalSize / 1024).toFixed(2)} KB`);
      console.log(`   压缩大小: ${(compressedSize / 1024).toFixed(2)} KB`);
      console.log(`   压缩率: ${compressionRatio.toFixed(2)}%`);

      return {
        buffer: compressedBuffer,
        base64: base64WithPrefix,
        originalSize,
        compressedSize,
        compressionRatio,
        width: targetWidth,
        height: targetHeight,
        format: opts.format
      };
    } catch (error) {
      console.error('图片压缩失败:', error);
      throw new Error(`图片压缩失败: ${(error as Error).message}`);
    }
  }

  /**
   * 压缩图片并保存到文件
   * @param inputPath 输入文件路径
   * @param outputPath 输出文件路径
   * @param options 压缩选项
   * @returns 压缩结果
   */
  async compressAndSave(
    inputPath: string,
    outputPath: string,
    options?: ImageCompressionOptions
  ): Promise<ImageCompressionResult> {
    try {
      const result = await this.compressImageFile(inputPath, options);

      // 保存压缩后的图片
      await writeFileAsync(outputPath, result.buffer);

      console.log(`✅ 压缩图片已保存到: ${outputPath}`);

      return result;
    } catch (error) {
      console.error('图片压缩并保存失败:', error);
      throw new Error(`图片压缩并保存失败: ${(error as Error).message}`);
    }
  }

  /**
   * 批量压缩图片
   * @param filePaths 图片文件路径数组
   * @param options 压缩选项
   * @returns 压缩结果数组
   */
  async compressBatch(
    filePaths: string[],
    options?: ImageCompressionOptions
  ): Promise<ImageCompressionResult[]> {
    try {
      const results = await Promise.all(
        filePaths.map(filePath => this.compressImageFile(filePath, options))
      );

      const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
      const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
      const totalCompressionRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;

      console.log(`✅ 批量压缩完成:`);
      console.log(`   文件数量: ${results.length}`);
      console.log(`   总原始大小: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
      console.log(`   总压缩大小: ${(totalCompressedSize / 1024).toFixed(2)} KB`);
      console.log(`   总压缩率: ${totalCompressionRatio.toFixed(2)}%`);

      return results;
    } catch (error) {
      console.error('批量压缩失败:', error);
      throw new Error(`批量压缩失败: ${(error as Error).message}`);
    }
  }
}

// 导出单例
export const imageCompressionService = new ImageCompressionService();
export default imageCompressionService;

