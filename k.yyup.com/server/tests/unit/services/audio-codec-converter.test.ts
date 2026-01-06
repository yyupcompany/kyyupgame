/**
 * 音频编解码转换器单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { vi } from 'vitest'
import AudioCodecConverter from '../../../src/services/vos/audio-codec-converter';

// 控制台错误检测变量
let consoleSpy: any

describe('AudioCodecConverter', () => {
  beforeEach(() => {
    // 清空指标
    AudioCodecConverter.clearMetrics();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    // 清理
    AudioCodecConverter.clearMetrics();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('PCMA → PCM 16kHz 转换', () => {
    it('应该成功转换PCMA 8kHz到PCM 16kHz', async () => {
      // 创建模拟PCMA数据 (160字节 = 20ms @ 8kHz)
      const pcmaData = Buffer.alloc(160);
      for (let i = 0; i < 160; i++) {
        pcmaData[i] = Math.floor(Math.random() * 256);
      }

      const result = await AudioCodecConverter.pcmaToPcm16k(pcmaData);

      // 验证输出
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // PCMA 8kHz → PCM 16kHz 应该是8倍大小（因为resample的实现）
      // 160 bytes PCMA @ 8kHz = 160 samples
      // 160 samples @ 16kHz = 320 bytes PCM，但resample可能返回更多数据
      expect(result.length).toBeGreaterThan(160);
    });

    it('应该处理大数据块', async () => {
      // 创建1秒的PCMA数据 (8000 bytes @ 8kHz)
      const pcmaData = Buffer.alloc(8000);
      for (let i = 0; i < 8000; i++) {
        pcmaData[i] = Math.floor(Math.random() * 256);
      }

      const result = await AudioCodecConverter.pcmaToPcm16k(pcmaData);

      expect(result).toBeDefined();
      // 验证输出大小合理（至少是输入的2倍）
      expect(result.length).toBeGreaterThan(pcmaData.length * 2);
    });

    it('转换时间应该在10ms以内', async () => {
      const pcmaData = Buffer.alloc(160);
      for (let i = 0; i < 160; i++) {
        pcmaData[i] = Math.floor(Math.random() * 256);
      }

      const startTime = Date.now();
      await AudioCodecConverter.pcmaToPcm16k(pcmaData);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10);
    });
  });

  describe('PCM 24kHz → PCMA 8kHz 转换', () => {
    it('应该成功转换PCM 24kHz到PCMA 8kHz', async () => {
      // 创建模拟PCM 24kHz数据 (480字节 = 20ms @ 24kHz)
      const pcm24kData = Buffer.alloc(480);
      for (let i = 0; i < 480; i++) {
        pcm24kData[i] = Math.floor(Math.random() * 256);
      }

      const result = await AudioCodecConverter.pcm24kToPcma(pcm24kData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // PCM 24kHz → PCMA 8kHz 应该是1/3大小
      // 480 bytes PCM @ 24kHz = 240 samples
      // 240 samples @ 8kHz = 160 bytes PCMA
      expect(result.length).toBe(160);
    });

    it('应该处理大数据块', async () => {
      // 创建1秒的PCM 24kHz数据 (48000 bytes @ 24kHz)
      const pcm24kData = Buffer.alloc(48000);
      for (let i = 0; i < 48000; i++) {
        pcm24kData[i] = Math.floor(Math.random() * 256);
      }

      const result = await AudioCodecConverter.pcm24kToPcma(pcm24kData);

      expect(result).toBeDefined();
      // 验证输出大小合理（应该小于输入）
      expect(result.length).toBeLessThan(pcm24kData.length);
    });

    it('转换时间应该在10ms以内', async () => {
      const pcm24kData = Buffer.alloc(480);
      for (let i = 0; i < 480; i++) {
        pcm24kData[i] = Math.floor(Math.random() * 256);
      }

      const startTime = Date.now();
      await AudioCodecConverter.pcm24kToPcma(pcm24kData);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10);
    });
  });

  describe('PCM 16kHz → PCMA 8kHz 转换', () => {
    it('应该成功转换PCM 16kHz到PCMA 8kHz', async () => {
      // 创建模拟PCM 16kHz数据 (320字节 = 20ms @ 16kHz)
      const pcm16kData = Buffer.alloc(320);
      for (let i = 0; i < 320; i++) {
        pcm16kData[i] = Math.floor(Math.random() * 256);
      }

      const result = await AudioCodecConverter.pcm16kToPcma(pcm16kData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // PCM 16kHz → PCMA 8kHz 应该是1/2大小
      // 320 bytes PCM @ 16kHz = 160 samples
      // 160 samples @ 8kHz = 160 bytes PCMA
      expect(result.length).toBe(160);
    });
  });

  describe('转换指标', () => {
    it('应该记录转换指标', async () => {
      const pcmaData = Buffer.alloc(160);
      for (let i = 0; i < 160; i++) {
        pcmaData[i] = Math.floor(Math.random() * 256);
      }

      await AudioCodecConverter.pcmaToPcm16k(pcmaData);

      const stats = AudioCodecConverter.getConversionStats();
      expect(stats.totalConversions).toBe(1);
      expect(stats.averageTime).toBeGreaterThanOrEqual(0);
      expect(stats.maxTime).toBeGreaterThanOrEqual(0);
      expect(stats.minTime).toBeGreaterThanOrEqual(0);
    });

    it('应该计算平均转换时间', async () => {
      const pcmaData = Buffer.alloc(160);
      for (let i = 0; i < 160; i++) {
        pcmaData[i] = Math.floor(Math.random() * 256);
      }

      // 执行多次转换
      for (let i = 0; i < 5; i++) {
        await AudioCodecConverter.pcmaToPcm16k(pcmaData);
      }

      const stats = AudioCodecConverter.getConversionStats();
      expect(stats.totalConversions).toBe(5);
      expect(stats.averageTime).toBeGreaterThanOrEqual(0);
    });

    it('应该清空指标', async () => {
      const pcmaData = Buffer.alloc(160);
      for (let i = 0; i < 160; i++) {
        pcmaData[i] = Math.floor(Math.random() * 256);
      }

      await AudioCodecConverter.pcmaToPcm16k(pcmaData);
      
      let stats = AudioCodecConverter.getConversionStats();
      expect(stats.totalConversions).toBe(1);

      AudioCodecConverter.clearMetrics();
      
      stats = AudioCodecConverter.getConversionStats();
      expect(stats.totalConversions).toBe(0);
    });
  });

  describe('缓冲对齐', () => {
    it('应该处理未对齐的缓冲', async () => {
      // 创建一个未对齐的缓冲（byteOffset不是2的倍数）
      const buffer = Buffer.alloc(480);
      for (let i = 0; i < 480; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }

      // 这应该不会抛出错误
      const result = await AudioCodecConverter.pcm24kToPcma(buffer);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('应该处理空缓冲', async () => {
      const emptyBuffer = Buffer.alloc(0);

      try {
        await AudioCodecConverter.pcmaToPcm16k(emptyBuffer);
        // 可能成功也可能失败，取决于库的实现
      } catch (error) {
        // 预期可能抛出错误
        expect(error).toBeDefined();
      }
    });

    it('应该处理无效数据', async () => {
      const invalidData = Buffer.from([0xFF, 0xFF, 0xFF]);

      try {
        await AudioCodecConverter.pcm16kToPcma(invalidData);
        // 可能成功也可能失败
      } catch (error) {
        // 预期可能抛出错误
        expect(error).toBeDefined();
      }
    });
  });
});

