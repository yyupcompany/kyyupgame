/**
 * 文件删除队列测试
 */

import * as fs from 'fs';
import * as path from 'path';
import { FileDeletionQueue } from '../file-deletion-queue';

describe('FileDeletionQueue', () => {
  let queue: FileDeletionQueue;
  let testDir: string;

  beforeEach(() => {
    queue = new FileDeletionQueue();
    testDir = path.join(__dirname, 'test-files');
    
    // 创建测试目录
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // 清理测试目录
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach(file => {
        try {
          fs.unlinkSync(path.join(testDir, file));
        } catch (error) {
          // 忽略错误
        }
      });
      fs.rmdirSync(testDir);
    }
  });

  describe('deleteFile', () => {
    it('应该成功删除单个文件', async () => {
      // 创建测试文件
      const testFile = path.join(testDir, 'test1.txt');
      fs.writeFileSync(testFile, 'test content');

      // 删除文件
      await queue.deleteFile(testFile);

      // 验证文件已删除
      expect(fs.existsSync(testFile)).toBe(false);
    });

    it('应该处理不存在的文件', async () => {
      const testFile = path.join(testDir, 'non-existent.txt');

      // 不应该抛出错误
      await expect(queue.deleteFile(testFile)).resolves.not.toThrow();
    });

    it('应该处理并发删除请求', async () => {
      // 创建多个测试文件
      const files = Array.from({ length: 10 }, (_, i) => {
        const filePath = path.join(testDir, `test${i}.txt`);
        fs.writeFileSync(filePath, `test content ${i}`);
        return filePath;
      });

      // 并发删除
      await Promise.all(files.map(file => queue.deleteFile(file)));

      // 验证所有文件已删除
      files.forEach(file => {
        expect(fs.existsSync(file)).toBe(false);
      });
    });
  });

  describe('deleteFiles', () => {
    it('应该批量删除多个文件', async () => {
      // 创建测试文件
      const files = Array.from({ length: 5 }, (_, i) => {
        const filePath = path.join(testDir, `batch${i}.txt`);
        fs.writeFileSync(filePath, `batch content ${i}`);
        return filePath;
      });

      // 批量删除
      await queue.deleteFiles(files);

      // 验证所有文件已删除
      files.forEach(file => {
        expect(fs.existsSync(file)).toBe(false);
      });
    });
  });

  describe('deleteFilesByPattern', () => {
    it('应该按字符串前缀删除文件', async () => {
      // 创建测试文件
      fs.writeFileSync(path.join(testDir, 'project1_scene1.mp3'), 'audio1');
      fs.writeFileSync(path.join(testDir, 'project1_scene2.mp3'), 'audio2');
      fs.writeFileSync(path.join(testDir, 'project2_scene1.mp3'), 'audio3');

      // 按前缀删除
      const count = await queue.deleteFilesByPattern(testDir, 'project1_');

      // 验证
      expect(count).toBe(2);
      expect(fs.existsSync(path.join(testDir, 'project1_scene1.mp3'))).toBe(false);
      expect(fs.existsSync(path.join(testDir, 'project1_scene2.mp3'))).toBe(false);
      expect(fs.existsSync(path.join(testDir, 'project2_scene1.mp3'))).toBe(true);
    });

    it('应该按正则表达式删除文件', async () => {
      // 创建测试文件
      fs.writeFileSync(path.join(testDir, 'audio1.mp3'), 'audio1');
      fs.writeFileSync(path.join(testDir, 'audio2.mp3'), 'audio2');
      fs.writeFileSync(path.join(testDir, 'video1.mp4'), 'video1');

      // 按正则删除
      const count = await queue.deleteFilesByPattern(testDir, /\.mp3$/);

      // 验证
      expect(count).toBe(2);
      expect(fs.existsSync(path.join(testDir, 'audio1.mp3'))).toBe(false);
      expect(fs.existsSync(path.join(testDir, 'audio2.mp3'))).toBe(false);
      expect(fs.existsSync(path.join(testDir, 'video1.mp4'))).toBe(true);
    });

    it('应该处理不存在的目录', async () => {
      const count = await queue.deleteFilesByPattern('/non-existent-dir', 'test_');
      expect(count).toBe(0);
    });

    it('应该处理没有匹配的文件', async () => {
      fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content1');
      
      const count = await queue.deleteFilesByPattern(testDir, 'nomatch_');
      expect(count).toBe(0);
      
      // 验证文件未被删除
      expect(fs.existsSync(path.join(testDir, 'file1.txt'))).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('应该返回队列状态', () => {
      const status = queue.getStatus();
      
      expect(status).toHaveProperty('queueLength');
      expect(status).toHaveProperty('processing');
      expect(status).toHaveProperty('lockedFiles');
      expect(typeof status.queueLength).toBe('number');
      expect(typeof status.processing).toBe('boolean');
      expect(typeof status.lockedFiles).toBe('number');
    });
  });

  describe('队列锁机制', () => {
    it('应该防止同一文件的并发删除', async () => {
      // 创建测试文件
      const testFile = path.join(testDir, 'locked.txt');
      fs.writeFileSync(testFile, 'test content');

      // 尝试并发删除同一文件
      const promises = Array.from({ length: 5 }, () => queue.deleteFile(testFile));
      
      // 不应该抛出错误
      await expect(Promise.all(promises)).resolves.not.toThrow();
      
      // 验证文件已删除
      expect(fs.existsSync(testFile)).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该在达到最大重试次数后拒绝', async () => {
      // 创建一个无法删除的文件路径（权限问题）
      const invalidPath = '/root/cannot-delete.txt';
      
      // 应该最终失败
      await expect(queue.deleteFile(invalidPath)).rejects.toThrow();
    }, 10000); // 增加超时时间
  });
});

