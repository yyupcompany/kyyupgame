/**
 * AI图片存储服务
 * 将AI生成的临时图片URL转存到租户OSS目录
 * 
 * 存储路径规则：
 * - demo系统 (k.yyup.cc) → kindergarten/rent/demo/ai-images/curriculum/{filename}
 * - 租户系统 (k001.yyup.cc) → kindergarten/rent/k001/ai-images/curriculum/{filename}
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { systemOSSService } from './system-oss.service';

/**
 * AI图片存储结果
 */
export interface AIImageStorageResult {
  success: boolean;
  originalUrl: string;
  ossUrl?: string;
  ossPath?: string;
  error?: string;
}

/**
 * 批量存储结果
 */
export interface AIImageBatchStorageResult {
  success: boolean;
  images: AIImageStorageResult[];
  thumbnailUrl?: string;
  thumbnailPath?: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
}

/**
 * AI图片存储服务类
 */
class AIImageStorageService {
  private readonly DEFAULT_TIMEOUT = 30000; // 30秒超时

  /**
   * 从URL下载图片
   */
  private async downloadImage(url: string): Promise<Buffer> {
    try {
      console.log(`📥 [AI图片存储] 下载图片: ${url.substring(0, 100)}...`);
      
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: this.DEFAULT_TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; KindergartenSystem/1.0)',
        },
      });

      const buffer = Buffer.from(response.data);
      console.log(`✅ [AI图片存储] 图片下载成功，大小: ${(buffer.length / 1024).toFixed(2)} KB`);
      
      return buffer;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ [AI图片存储] 图片下载失败:`, errorMsg);
      throw new Error(`图片下载失败: ${errorMsg}`);
    }
  }

  /**
   * 获取图片的Content-Type
   */
  private getContentType(url: string): string {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.png') || lowerUrl.includes('format=png')) {
      return 'image/png';
    }
    if (lowerUrl.includes('.gif')) {
      return 'image/gif';
    }
    if (lowerUrl.includes('.webp')) {
      return 'image/webp';
    }
    // 默认为JPEG
    return 'image/jpeg';
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(contentType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    return extensions[contentType] || 'jpg';
  }

  /**
   * 存储单张AI生成的图片到租户OSS
   * @param imageUrl 图片临时URL
   * @param ossNamespace 租户OSS命名空间（demo 或 k001 等）
   * @param category 图片分类（curriculum/activity/poster等）
   * @param customFilename 自定义文件名（可选）
   */
  async storeImage(
    imageUrl: string,
    ossNamespace: string,
    category: string = 'curriculum',
    customFilename?: string
  ): Promise<AIImageStorageResult> {
    try {
      // 1. 验证参数
      if (!imageUrl) {
        return { success: false, originalUrl: '', error: '图片URL不能为空' };
      }
      if (!ossNamespace) {
        return { success: false, originalUrl: imageUrl, error: 'OSS命名空间不能为空' };
      }

      // 2. 下载图片
      const imageBuffer = await this.downloadImage(imageUrl);

      // 3. 确定文件名和Content-Type
      const contentType = this.getContentType(imageUrl);
      const extension = this.getFileExtension(contentType);
      const filename = customFilename || `${uuidv4()}.${extension}`;

      // 4. 构建OSS存储路径
      // 路径格式: rent/{ossNamespace}/ai-images/{category}/{filename}
      const directory = `rent/${ossNamespace}/ai-images/${category}`;

      // 5. 上传到OSS
      console.log(`📤 [AI图片存储] 上传到OSS: ${directory}/${filename}`);
      
      const result = await systemOSSService.uploadFile(imageBuffer, {
        filename,
        directory,
        contentType,
        isPublic: true, // AI生成的课程图片需要公开访问
      });

      console.log(`✅ [AI图片存储] 上传成功: ${result.url}`);

      return {
        success: true,
        originalUrl: imageUrl,
        ossUrl: result.url,
        ossPath: result.ossPath,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ [AI图片存储] 存储失败:`, errorMsg);
      return {
        success: false,
        originalUrl: imageUrl,
        error: errorMsg,
      };
    }
  }

  /**
   * 批量存储AI生成的图片
   * @param images 图片数组 [{url, id, description}]
   * @param ossNamespace 租户OSS命名空间
   * @param category 图片分类
   * @param useFirstAsThumbnail 是否使用第一张图作为缩略图
   */
  async storeImages(
    images: Array<{ url: string; id?: string; description?: string }>,
    ossNamespace: string,
    category: string = 'curriculum',
    useFirstAsThumbnail: boolean = true
  ): Promise<AIImageBatchStorageResult> {
    const results: AIImageStorageResult[] = [];
    let thumbnailUrl: string | undefined;
    let thumbnailPath: string | undefined;

    console.log(`🖼️ [AI图片存储] 开始批量存储 ${images.length} 张图片到 ${ossNamespace}/${category}`);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      if (!image.url) {
        results.push({
          success: false,
          originalUrl: '',
          error: '图片URL为空',
        });
        continue;
      }

      // 使用图片ID或索引作为文件名前缀
      const prefix = image.id || `img_${i + 1}`;
      const result = await this.storeImage(
        image.url,
        ossNamespace,
        category,
        `${prefix}_${uuidv4().substring(0, 8)}`
      );

      results.push(result);

      // 使用第一张成功上传的图片作为缩略图
      if (useFirstAsThumbnail && !thumbnailUrl && result.success && result.ossUrl) {
        thumbnailUrl = result.ossUrl;
        thumbnailPath = result.ossPath;
        console.log(`📌 [AI图片存储] 设置缩略图: ${thumbnailUrl}`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`📊 [AI图片存储] 批量存储完成: ${successCount}成功, ${failedCount}失败`);

    return {
      success: successCount > 0,
      images: results,
      thumbnailUrl,
      thumbnailPath,
      totalCount: images.length,
      successCount,
      failedCount,
    };
  }

  /**
   * 从请求对象获取OSS命名空间
   */
  getOssNamespaceFromRequest(req: any): string {
    const tenant = req?.tenant;
    
    // 优先使用ossNamespace，其次使用租户代码
    const namespace = tenant?.ossNamespace || tenant?.code || 'demo';
    
    console.log(`🔍 [AI图片存储] 解析OSS命名空间: ${namespace}`, {
      ossNamespace: tenant?.ossNamespace,
      code: tenant?.code,
      domain: tenant?.domain,
    });
    
    return namespace;
  }

  /**
   * 存储课程缩略图
   * @param imageUrl 图片URL
   * @param ossNamespace 租户OSS命名空间
   * @param curriculumId 课程ID（用于文件名）
   */
  async storeCurriculumThumbnail(
    imageUrl: string,
    ossNamespace: string,
    curriculumId: number | string
  ): Promise<AIImageStorageResult> {
    return this.storeImage(
      imageUrl,
      ossNamespace,
      'curriculum/thumbnails',
      `curriculum_${curriculumId}_thumb`
    );
  }

  /**
   * 存储课程图片并返回更新后的图片数组
   * @param images 原始图片数组
   * @param ossNamespace 租户OSS命名空间
   */
  async storeCurriculumImages(
    images: Array<{ id: string; url: string; description?: string; order?: number }>,
    ossNamespace: string
  ): Promise<{
    storedImages: Array<{ id: string; url: string; description?: string; order?: number }>;
    thumbnailUrl?: string;
    thumbnailPath?: string;
  }> {
    if (!images || images.length === 0) {
      return { storedImages: [] };
    }

    const batchResult = await this.storeImages(
      images.map(img => ({ url: img.url, id: img.id, description: img.description })),
      ossNamespace,
      'curriculum'
    );

    // 构建更新后的图片数组，将临时URL替换为OSS URL
    const storedImages = images.map((img, index) => {
      const result = batchResult.images[index];
      return {
        ...img,
        url: result.success && result.ossUrl ? result.ossUrl : img.url,
      };
    });

    return {
      storedImages,
      thumbnailUrl: batchResult.thumbnailUrl,
      thumbnailPath: batchResult.thumbnailPath,
    };
  }
}

// 导出单例
export const aiImageStorageService = new AIImageStorageService();
