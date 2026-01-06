/**
 * OSS安全测试
 * 测试OSS租户隔离安全机制
 */

import { ossTenantSecurityService } from '../services/oss-tenant-security.service';
import { ossService } from '../services/oss.service';

describe('OSS租户安全服务测试', () => {
  const testPhone1 = '13800138000';
  const testPhone2 = '13900139000';
  const testTenantCode = 'k001';

  describe('广州OSS路径验证', () => {
    test('公共资源路径应该允许访问', () => {
      const publicPaths = [
        'kindergarten/system/games/audio/test.mp3',
        'kindergarten/games/images/logo.png',
        'kindergarten/education/videos/lesson1.mp4',
        'kindergarten/development/test.json',
      ];

      publicPaths.forEach(path => {
        const result = ossTenantSecurityService.validateOSSPathAccess(testPhone1, testTenantCode, path);
        expect(result.isValid).toBe(true);
        expect(result.accessType).toBe('public');
      });
    });

    test('租户资源路径应该只允许对应租户访问', () => {
      const tenantPath = `kindergarten/rent/${testPhone1}/tenant-data/file.txt`;
      
      // 同一租户应该能访问
      const result1 = ossTenantSecurityService.validateOSSPathAccess(testPhone1, testTenantCode, tenantPath);
      expect(result1.isValid).toBe(true);
      expect(result1.accessType).toBe('tenant');

      // 其他租户不应该能访问
      const result2 = ossTenantSecurityService.validateOSSPathAccess(testPhone2, testTenantCode, tenantPath);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toContain('越权');
    });
  });

  describe('上海OSS路径验证', () => {
    test('公共资源路径应该允许访问', () => {
      const publicPath = 'kindergarten/test-faces/sample.jpg';
      const result = ossTenantSecurityService.validateShanghaiOSSPath(testPhone1, publicPath);
      expect(result.isValid).toBe(true);
      expect(result.accessType).toBe('public');
    });

    test('租户照片路径应该只允许对应租户访问', () => {
      const tenantPhotoPath = `kindergarten/rent/${testPhone1}/photos/2025-11/test.jpg`;
      
      // 同一租户应该能访问
      const result1 = ossTenantSecurityService.validateShanghaiOSSPath(testPhone1, tenantPhotoPath);
      expect(result1.isValid).toBe(true);
      expect(result1.accessType).toBe('tenant');

      // 其他租户不应该能访问
      const result2 = ossTenantSecurityService.validateShanghaiOSSPath(testPhone2, tenantPhotoPath);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toContain('越权');
    });

    test('租户学生照片路径应该只允许对应租户访问', () => {
      const studentPath = `kindergarten/rent/${testPhone1}/students/student_001.jpg`;
      
      const result1 = ossTenantSecurityService.validateShanghaiOSSPath(testPhone1, studentPath);
      expect(result1.isValid).toBe(true);

      const result2 = ossTenantSecurityService.validateShanghaiOSSPath(testPhone2, studentPath);
      expect(result2.isValid).toBe(false);
    });

    test('旧版非隔离路径应该允许访问（向后兼容）', () => {
      const oldPaths = [
        'kindergarten/photos/2025-11/old-photo.jpg',
        'kindergarten/students/old-student.jpg',
      ];

      oldPaths.forEach(path => {
        const result = ossTenantSecurityService.validateShanghaiOSSPath(testPhone1, path);
        expect(result.isValid).toBe(true);
        expect(result.accessType).toBe('public');
      });
    });
  });

  describe('路径生成测试', () => {
    test('生成广州OSS租户路径', () => {
      const path = ossTenantSecurityService.generateTenantOSSPath(testPhone1, 'uploads/file.txt');
      expect(path).toBe(`kindergarten/rent/${testPhone1}/uploads/file.txt`);
    });

    test('生成上海OSS租户照片路径', () => {
      const path = ossTenantSecurityService.generateShanghaiTenantPath(testPhone1, 'photos', '2025-11/test.jpg');
      expect(path).toBe(`kindergarten/rent/${testPhone1}/photos/2025-11/test.jpg`);
    });

    test('生成上海OSS租户学生照片路径', () => {
      const path = ossTenantSecurityService.generateShanghaiTenantPath(testPhone1, 'students');
      expect(path).toBe(`kindergarten/rent/${testPhone1}/students/`);
    });

    test('无效手机号应该抛出错误', () => {
      expect(() => ossTenantSecurityService.generateTenantOSSPath('123', 'test')).toThrow('手机号');
      expect(() => ossTenantSecurityService.generateShanghaiTenantPath('', 'photos')).toThrow('手机号');
    });
  });

  describe('Bucket识别测试', () => {
    test('识别上海OSS URL', () => {
      const shanghaiUrls = [
        'https://faceshanghaikarden.oss-cn-shanghai.aliyuncs.com/kindergarten/photos/test.jpg',
        'https://faceshanghaikarden.oss-cn-shanghai.aliyuncs.com/kindergarten/rent/13800138000/photos/test.jpg',
      ];

      shanghaiUrls.forEach(url => {
        const bucket = ossTenantSecurityService.getBucketFromUrl(url);
        expect(bucket).toBe('shanghai');
      });
    });

    test('识别广州OSS URL', () => {
      const guangzhouUrls = [
        'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/test.mp3',
        'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/rent/13800138000/test.txt',
      ];

      guangzhouUrls.forEach(url => {
        const bucket = ossTenantSecurityService.getBucketFromUrl(url);
        expect(bucket).toBe('guangzhou');
      });
    });
  });

  describe('统一验证测试', () => {
    test('自动识别并验证上海OSS', () => {
      const url = `https://faceshanghaikarden.oss-cn-shanghai.aliyuncs.com/kindergarten/rent/${testPhone1}/photos/test.jpg`;
      const result = ossTenantSecurityService.validateOSSPathUnified(testPhone1, url);
      expect(result.isValid).toBe(true);
      expect(result.bucket).toBe('shanghai');
    });

    test('自动识别并验证广州OSS', () => {
      const url = `https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/rent/${testPhone1}/test.txt`;
      const result = ossTenantSecurityService.validateOSSPathUnified(testPhone1, url);
      expect(result.isValid).toBe(true);
      expect(result.bucket).toBe('guangzhou');
    });
  });
});

describe('OSS服务租户隔离测试', () => {
  const testPhone = '13800138000';

  test('生成租户隔离路径', () => {
    const path = ossService.getTenantPath(testPhone, 'photos', '2025-11');
    expect(path).toContain(`rent/${testPhone}/photos/2025-11`);
  });

  test('验证路径访问 - 公共资源', () => {
    const result = ossService.validatePathAccess(testPhone, 'kindergarten/test-faces/sample.jpg');
    expect(result.isValid).toBe(true);
    expect(result.accessType).toBe('public');
  });

  test('验证路径访问 - 租户资源', () => {
    const path = `kindergarten/rent/${testPhone}/photos/test.jpg`;
    const result = ossService.validatePathAccess(testPhone, path);
    expect(result.isValid).toBe(true);
    expect(result.accessType).toBe('tenant');
  });

  test('验证路径访问 - 越权访问', () => {
    const path = 'kindergarten/rent/13900139000/photos/test.jpg';
    const result = ossService.validatePathAccess(testPhone, path);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('无权访问');
  });
});

console.log('✅ OSS安全测试用例已准备就绪');

