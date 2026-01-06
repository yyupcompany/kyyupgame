/**
 * 模拟数据生成器测试
 * 测试各种数据生成功能
 */

import {
  getRandomInt,
  generateRealName,
  generatePhoneNumber,
  generateEmail,
  generateChildBirthday,
  generateEducationLevel,
  generateOccupation,
  generateCompany,
  generateClassName,
  generateActivityName,
  generateAddress
} from '../../../src/utils/mockDataGenerator';
import { vi } from 'vitest'


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('Mock Data Generator', () => {
  describe('getRandomInt', () => {
    it('应该生成指定范围内的随机整数', () => {
      const min = 1;
      const max = 10;
      
      for (let i = 0; i < 100; i++) {
        const result = getRandomInt(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('应该处理相同的最小值和最大值', () => {
      const value = 5;
      const result = getRandomInt(value, value);
      expect(result).toBe(value);
    });

    it('应该处理负数范围', () => {
      const min = -10;
      const max = -1;
      
      for (let i = 0; i < 50; i++) {
        const result = getRandomInt(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
      }
    });

    it('应该处理包含0的范围', () => {
      const min = -5;
      const max = 5;
      
      for (let i = 0; i < 50; i++) {
        const result = getRandomInt(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
      }
    });
  });

  describe('generateRealName', () => {
    it('应该生成真实的中文姓名', () => {
      const name = generateRealName();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(1);
      expect(name.length).toBeLessThanOrEqual(4);
    });

    it('应该为儿童生成合适的名字', () => {
      const childName = generateRealName(false, true);
      expect(typeof childName).toBe('string');
      expect(childName.length).toBeGreaterThan(1);
    });

    it('应该生成不同的名字', () => {
      const names = new Set();
      for (let i = 0; i < 50; i++) {
        names.add(generateRealName());
      }
      // 应该有一定的多样性
      expect(names.size).toBeGreaterThan(10);
    });

    it('应该处理性别参数', () => {
      const maleName = generateRealName(false);
      const femaleName = generateRealName(true);
      
      expect(typeof maleName).toBe('string');
      expect(typeof femaleName).toBe('string');
    });
  });

  describe('generatePhoneNumber', () => {
    it('应该生成有效的手机号格式', () => {
      const phone = generatePhoneNumber();
      expect(typeof phone).toBe('string');
      expect(phone.length).toBe(11);
      expect(/^1[3-9]\d{9}$/.test(phone)).toBe(true);
    });

    it('应该生成不同的手机号', () => {
      const phones = new Set();
      for (let i = 0; i < 50; i++) {
        phones.add(generatePhoneNumber());
      }
      expect(phones.size).toBeGreaterThan(40); // 应该有很高的多样性
    });

    it('应该使用有效的手机号前缀', () => {
      const validPrefixes = ['134', '135', '136', '137', '138', '139', '150', '151', '152', '157', '158', '159', '182', '183', '184', '187', '188', '178', '170', '186'];
      
      for (let i = 0; i < 20; i++) {
        const phone = generatePhoneNumber();
        const prefix = phone.substring(0, 3);
        expect(validPrefixes).toContain(prefix);
      }
    });
  });

  describe('generateEmail', () => {
    it('应该生成有效的邮箱格式', () => {
      const name = '张三';
      const email = generateEmail(name);
      expect(typeof email).toBe('string');
      expect(email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
    });

    it('应该包含数字后缀', () => {
      const name = '李四';
      const email = generateEmail(name);
      expect(email).toMatch(/\d{4}@/);
    });

    it('应该使用有效的域名', () => {
      const validDomains = ['gmail.com', 'qq.com', '163.com', '126.com', 'outlook.com', 'hotmail.com', 'sina.com', 'sohu.com', 'yahoo.com'];
      const name = '王五';
      
      for (let i = 0; i < 20; i++) {
        const email = generateEmail(name);
        const domain = email.split('@')[1];
        expect(validDomains).toContain(domain);
      }
    });

    it('应该处理空名字', () => {
      const email = generateEmail('');
      expect(typeof email).toBe('string');
      expect(email).toMatch(/^user\d{4}@[^@]+\.[^@]+$/);
    });

    it('应该处理特殊字符名字', () => {
      const email = generateEmail('张@三#');
      expect(typeof email).toBe('string');
      expect(email).toMatch(/^.+@[^@]+\.[^@]+$/); // 允许@符号在用户名部分，但不在域名部分
    });
  });

  describe('generateChildBirthday', () => {
    it('应该生成合理年龄范围的生日', () => {
      const birthday = generateChildBirthday();
      expect(birthday instanceof Date).toBe(true);
      
      const now = new Date();
      const ageInYears = (now.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      expect(ageInYears).toBeGreaterThanOrEqual(2.5);
      expect(ageInYears).toBeLessThanOrEqual(6);
    });

    it('应该生成不同的生日', () => {
      const birthdays = new Set();
      for (let i = 0; i < 20; i++) {
        birthdays.add(generateChildBirthday().toISOString());
      }
      expect(birthdays.size).toBeGreaterThan(15);
    });

    it('应该生成有效的日期对象', () => {
      const birthday = generateChildBirthday();
      expect(birthday instanceof Date).toBe(true);
      expect(isNaN(birthday.getTime())).toBe(false);
    });
  });

  describe('generateEducationLevel', () => {
    it('应该生成有效的教育程度', () => {
      const validLevels = ['高中', '专科', '本科', '硕士', '博士'];
      const level = generateEducationLevel();
      expect(validLevels).toContain(level);
    });

    it('应该生成不同的教育程度', () => {
      const levels = new Set();
      for (let i = 0; i < 50; i++) {
        levels.add(generateEducationLevel());
      }
      expect(levels.size).toBeGreaterThan(1);
    });
  });

  describe('generateOccupation', () => {
    it('应该生成有效的职业', () => {
      const occupation = generateOccupation();
      expect(typeof occupation).toBe('string');
      expect(occupation.length).toBeGreaterThan(0);
    });

    it('应该生成不同的职业', () => {
      const occupations = new Set();
      for (let i = 0; i < 50; i++) {
        occupations.add(generateOccupation());
      }
      expect(occupations.size).toBeGreaterThan(10);
    });
  });

  describe('generateCompany', () => {
    it('应该生成有效的公司名称', () => {
      const company = generateCompany();
      expect(typeof company).toBe('string');
      expect(company.length).toBeGreaterThan(0);
    });

    it('应该生成不同的公司名称', () => {
      const companies = new Set();
      for (let i = 0; i < 50; i++) {
        companies.add(generateCompany());
      }
      expect(companies.size).toBeGreaterThan(10);
    });
  });

  describe('generateClassName', () => {
    it('应该生成有效的班级名称', () => {
      const className = generateClassName();
      expect(typeof className).toBe('string');
      expect(className).toMatch(/^(小班|中班|大班).+班$/);
    });

    it('应该生成不同的班级名称', () => {
      const classNames = new Set();
      for (let i = 0; i < 30; i++) {
        classNames.add(generateClassName());
      }
      expect(classNames.size).toBeGreaterThan(10);
    });
  });

  describe('generateActivityName', () => {
    it('应该生成有效的活动名称', () => {
      const activityName = generateActivityName();
      expect(typeof activityName).toBe('string');
      expect(activityName).toMatch(/^(春季|夏季|秋季|冬季).+$/);
    });

    it('应该生成不同的活动名称', () => {
      const activityNames = new Set();
      for (let i = 0; i < 40; i++) {
        activityNames.add(generateActivityName());
      }
      expect(activityNames.size).toBeGreaterThan(15);
    });
  });

  describe('generateAddress', () => {
    it('应该生成有效的地址格式', () => {
      const address = generateAddress();
      expect(typeof address).toBe('string');
      expect(address.length).toBeGreaterThan(10);
      expect(address).toMatch(/.*省|.*市.*区.*号$/);
    });

    it('应该生成不同的地址', () => {
      const addresses = new Set();
      for (let i = 0; i < 50; i++) {
        addresses.add(generateAddress());
      }
      expect(addresses.size).toBeGreaterThan(20);
    });

    it('应该包含门牌号', () => {
      const address = generateAddress();
      expect(address).toMatch(/\d+号$/);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理极端随机数范围', () => {
      expect(() => getRandomInt(0, 0)).not.toThrow();
      expect(() => getRandomInt(-1000, 1000)).not.toThrow();
      expect(() => getRandomInt(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    it('应该处理大量数据生成', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        generateRealName();
        generatePhoneNumber();
        generateEmail('测试');
        generateChildBirthday();
        generateEducationLevel();
        generateOccupation();
        generateCompany();
        generateClassName();
        generateActivityName();
        generateAddress();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 1000次生成应该在合理时间内完成（比如5秒）
      expect(duration).toBeLessThan(5000);
    });
  });
});
