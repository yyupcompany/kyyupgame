/**
 * 系统 OSS 服务 - 广东 OSS（系统资源）
 * 用于上传系统级文件：Logo、图标、文档等
 */
import axios from 'axios';

interface UploadOptions {
  directory?: string;  // 子目录
  filename?: string;   // 自定义文件名
}

interface UploadResult {
  url: string;
  filename: string;
  size: number;
  ossPath: string;
}

class SystemOSSService {
  /**
   * 上传文件到广东 OSS（系统资源）
   */
  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options.directory) {
        formData.append('directory', options.directory);
      }
      
      if (options.filename) {
        formData.append('filename', options.filename);
      }

      const response = await axios.post('/api/system-oss/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '上传失败');
      }
    } catch (error: any) {
      console.error('系统文件上传失败:', error);
      throw error;
    }
  }

  /**
   * 获取文件临时访问URL
   */
  async getTemporaryUrl(ossPath: string, expiresInMinutes: number = 60): Promise<string> {
    try {
      const response = await axios.post('/api/system-oss/get-url', {
        ossPath,
        expiresInMinutes
      });

      if (response.data.success) {
        return response.data.data.url;
      } else {
        throw new Error(response.data.message || '获取URL失败');
      }
    } catch (error: any) {
      console.error('获取文件URL失败:', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(ossPath: string): Promise<void> {
    try {
      const response = await axios.delete('/api/system-oss/delete', {
        data: { ossPath }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || '删除失败');
      }
    } catch (error: any) {
      console.error('删除文件失败:', error);
      throw error;
    }
  }
}

export const systemOSSService = new SystemOSSService();
export default systemOSSService;
