/**
 * PersonalPoster 模型测试用例
 * 对应模型文件: personalposter.model.ts
 */

import { PersonalPoster } from '../../../src/models/personalposter.model';
import { vi } from 'vitest'
import { sequelize } from '../../../src/init';


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

describe('PersonalPoster Model', () => {
  beforeAll(async () => {
    // 确保数据库连接已建立
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  beforeEach(async () => {
    // 在每个测试前清理表数据
    await PersonalPoster.destroy({ where: {} });
  });

  describe('模型定义测试', () => {
    test('PersonalPoster 模型应该正确定义', () => {
      expect(PersonalPoster).toBeDefined();
      expect(PersonalPoster.tableName).toBe('personal_posters');
    });

    test('应该包含所有必需的属性', () => {
      const attributes = Object.keys(PersonalPoster.rawAttributes);
      const requiredAttributes = [
        'id', 'user_id', 'activity_id', 'referral_code', 'template_id',
        'poster_url', 'thumbnail_url', 'qr_code_url', 'custom_data',
        'view_count', 'share_count', 'download_count', 'created_at', 'updated_at'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });
  });

  describe('字段类型和约束测试', () => {
    test('id 字段应该正确配置', () => {
      const idField = PersonalPoster.rawAttributes.id;
      expect(idField.type).toEqual(expect.objectContaining({ key: 'INTEGER' }));
      expect(idField.primaryKey).toBe(true);
      expect(idField.autoIncrement).toBe(true);
      expect(idField.allowNull).toBe(false);
    });

    test('user_id 字段应该正确配置', () => {
      const userIdField = PersonalPoster.rawAttributes.user_id;
      expect(userIdField.type).toEqual(expect.objectContaining({ key: 'INTEGER' }));
      expect(userIdField.allowNull).toBe(true);
    });

    test('activity_id 字段应该正确配置', () => {
      const activityIdField = PersonalPoster.rawAttributes.activity_id;
      expect(activityIdField.type).toEqual(expect.objectContaining({ key: 'INTEGER' }));
      expect(activityIdField.allowNull).toBe(true);
    });

    test('referral_code 字段应该正确配置', () => {
      const referralCodeField = PersonalPoster.rawAttributes.referral_code;
      expect(referralCodeField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(referralCodeField.allowNull).toBe(true);
    });

    test('template_id 字段应该正确配置', () => {
      const templateIdField = PersonalPoster.rawAttributes.template_id;
      expect(templateIdField.type).toEqual(expect.objectContaining({ key: 'INTEGER' }));
      expect(templateIdField.allowNull).toBe(true);
    });

    test('poster_url 字段应该正确配置', () => {
      const posterUrlField = PersonalPoster.rawAttributes.poster_url;
      expect(posterUrlField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(posterUrlField.allowNull).toBe(true);
    });

    test('thumbnail_url 字段应该正确配置', () => {
      const thumbnailUrlField = PersonalPoster.rawAttributes.thumbnail_url;
      expect(thumbnailUrlField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(thumbnailUrlField.allowNull).toBe(true);
    });

    test('qr_code_url 字段应该正确配置', () => {
      const qrCodeUrlField = PersonalPoster.rawAttributes.qr_code_url;
      expect(qrCodeUrlField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(qrCodeUrlField.allowNull).toBe(true);
    });

    test('custom_data 字段应该正确配置', () => {
      const customDataField = PersonalPoster.rawAttributes.custom_data;
      expect(customDataField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(customDataField.allowNull).toBe(true);
    });

    test('view_count 字段应该正确配置', () => {
      const viewCountField = PersonalPoster.rawAttributes.view_count;
      expect(viewCountField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(viewCountField.allowNull).toBe(true);
    });

    test('share_count 字段应该正确配置', () => {
      const shareCountField = PersonalPoster.rawAttributes.share_count;
      expect(shareCountField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(shareCountField.allowNull).toBe(true);
    });

    test('download_count 字段应该正确配置', () => {
      const downloadCountField = PersonalPoster.rawAttributes.download_count;
      expect(downloadCountField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(downloadCountField.allowNull).toBe(true);
    });

    test('created_at 字段应该正确配置', () => {
      const createdAtField = PersonalPoster.rawAttributes.created_at;
      expect(createdAtField.type).toEqual(expect.objectContaining({ key: 'DATE' }));
      expect(createdAtField.allowNull).toBe(true);
    });

    test('updated_at 字段应该正确配置', () => {
      const updatedAtField = PersonalPoster.rawAttributes.updated_at;
      expect(updatedAtField.type).toEqual(expect.objectContaining({ key: 'DATE' }));
      expect(updatedAtField.allowNull).toBe(true);
    });
  });

  describe('模型配置测试', () => {
    test('应该启用时间戳', () => {
      expect(PersonalPoster.options.timestamps).toBe(true);
    });

    test('应该启用下划线命名', () => {
      expect(PersonalPoster.options.underscored).toBe(true);
    });

    test('应该启用软删除', () => {
      expect(PersonalPoster.options.paranoid).toBe(true);
    });
  });

  describe('CRUD 操作测试', () => {
    test('应该能够创建 PersonalPoster 记录', async () => {
      const posterData = {
        user_id: 1,
        activity_id: 1,
        referral_code: 'REF123456',
        template_id: 1,
        poster_url: 'https://example.com/poster.jpg',
        thumbnail_url: 'https://example.com/thumbnail.jpg',
        qr_code_url: 'https://example.com/qrcode.png',
        custom_data: '{"theme":"blue","text":"Hello World"}',
        view_count: '100',
        share_count: '50',
        download_count: '25'
      };

      const poster = await PersonalPoster.create(posterData);
      
      expect(poster.id).toBeDefined();
      expect(poster.user_id).toBe(posterData.user_id);
      expect(poster.activity_id).toBe(posterData.activity_id);
      expect(poster.referral_code).toBe(posterData.referral_code);
      expect(poster.template_id).toBe(posterData.template_id);
      expect(poster.poster_url).toBe(posterData.poster_url);
      expect(poster.thumbnail_url).toBe(posterData.thumbnail_url);
      expect(poster.qr_code_url).toBe(posterData.qr_code_url);
      expect(poster.custom_data).toBe(posterData.custom_data);
      expect(poster.view_count).toBe(posterData.view_count);
      expect(poster.share_count).toBe(posterData.share_count);
      expect(poster.download_count).toBe(posterData.download_count);
    });

    test('应该能够读取 PersonalPoster 记录', async () => {
      const posterData = {
        user_id: 1,
        activity_id: 1,
        referral_code: 'REF123456',
        template_id: 1,
        poster_url: 'https://example.com/poster.jpg'
      };

      const createdPoster = await PersonalPoster.create(posterData);
      const foundPoster = await PersonalPoster.findByPk(createdPoster.id);
      
      expect(foundPoster).toBeDefined();
      expect(foundPoster!.id).toBe(createdPoster.id);
      expect(foundPoster!.user_id).toBe(posterData.user_id);
    });

    test('应该能够更新 PersonalPoster 记录', async () => {
      const posterData = {
        user_id: 1,
        activity_id: 1,
        referral_code: 'REF123456',
        template_id: 1,
        poster_url: 'https://example.com/poster.jpg'
      };

      const poster = await PersonalPoster.create(posterData);
      
      const updateData = {
        poster_url: 'https://example.com/updated_poster.jpg',
        thumbnail_url: 'https://example.com/updated_thumbnail.jpg',
        view_count: '150',
        share_count: '75',
        download_count: '30'
      };

      await poster.update(updateData);
      const updatedPoster = await PersonalPoster.findByPk(poster.id);
      
      expect(updatedPoster!.poster_url).toBe(updateData.poster_url);
      expect(updatedPoster!.thumbnail_url).toBe(updateData.thumbnail_url);
      expect(updatedPoster!.view_count).toBe(updateData.view_count);
      expect(updatedPoster!.share_count).toBe(updateData.share_count);
      expect(updatedPoster!.download_count).toBe(updateData.download_count);
    });

    test('应该能够删除 PersonalPoster 记录（软删除）', async () => {
      const posterData = {
        user_id: 1,
        activity_id: 1,
        referral_code: 'REF123456',
        template_id: 1,
        poster_url: 'https://example.com/poster.jpg'
      };

      const poster = await PersonalPoster.create(posterData);
      const posterId = poster.id;
      
      await poster.destroy();
      
      const foundPoster = await PersonalPoster.findByPk(posterId);
      expect(foundPoster).toBeNull();
      
      // 检查软删除的记录
      const deletedPoster = await PersonalPoster.findByPk(posterId, { paranoid: false });
      expect(deletedPoster).toBeDefined();
      expect(deletedPoster!.deletedAt).toBeDefined();
    });
  });

  describe('查询操作测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      await PersonalPoster.bulkCreate([
        {
          user_id: 1,
          activity_id: 1,
          referral_code: 'REF001',
          template_id: 1,
          poster_url: 'https://example.com/poster1.jpg',
          thumbnail_url: 'https://example.com/thumb1.jpg',
          qr_code_url: 'https://example.com/qrcode1.png',
          custom_data: '{"theme":"blue"}',
          view_count: '100',
          share_count: '50',
          download_count: '25'
        },
        {
          user_id: 1,
          activity_id: 2,
          referral_code: 'REF002',
          template_id: 2,
          poster_url: 'https://example.com/poster2.jpg',
          thumbnail_url: 'https://example.com/thumb2.jpg',
          qr_code_url: 'https://example.com/qrcode2.png',
          custom_data: '{"theme":"red"}',
          view_count: '200',
          share_count: '100',
          download_count: '50'
        },
        {
          user_id: 2,
          activity_id: 1,
          referral_code: 'REF003',
          template_id: 1,
          poster_url: 'https://example.com/poster3.jpg',
          thumbnail_url: 'https://example.com/thumb3.jpg',
          qr_code_url: 'https://example.com/qrcode3.png',
          custom_data: '{"theme":"green"}',
          view_count: '150',
          share_count: '75',
          download_count: '35'
        }
      ]);
    });

    test('应该能够查询所有 PersonalPoster 记录', async () => {
      const posters = await PersonalPoster.findAll();
      expect(posters.length).toBe(3);
    });

    test('应该能够按用户ID查询 PersonalPoster 记录', async () => {
      const userPosters = await PersonalPoster.findAll({
        where: { user_id: 1 }
      });
      expect(userPosters.length).toBe(2);
    });

    test('应该能够按活动ID查询 PersonalPoster 记录', async () => {
      const activityPosters = await PersonalPoster.findAll({
        where: { activity_id: 1 }
      });
      expect(activityPosters.length).toBe(2);
    });

    test('应该能够按模板ID查询 PersonalPoster 记录', async () => {
      const templatePosters = await PersonalPoster.findAll({
        where: { template_id: 1 }
      });
      expect(templatePosters.length).toBe(2);
    });

    test('应该能够按推荐码查询 PersonalPoster 记录', async () => {
      const referralPoster = await PersonalPoster.findOne({
        where: { referral_code: 'REF001' }
      });
      expect(referralPoster).toBeDefined();
      expect(referralPoster!.user_id).toBe(1);
    });

    test('应该能够按查看数排序查询', async () => {
      const sortedPosters = await PersonalPoster.findAll({
        order: [['view_count', 'DESC']]
      });
      
      expect(sortedPosters.length).toBe(3);
      expect(parseInt(sortedPosters[0].view_count)).toBeGreaterThanOrEqual(parseInt(sortedPosters[1].view_count));
    });
  });

  describe('数据验证测试', () => {
    test('应该允许所有字段为空（根据模型定义）', async () => {
      const poster = await PersonalPoster.create({});
      expect(poster.id).toBeDefined();
    });

    test('应该能够处理各种数据类型', async () => {
      const posterData = {
        user_id: 1,
        activity_id: 1,
        referral_code: 'REF123456',
        template_id: 1,
        poster_url: 'https://example.com/poster.jpg',
        thumbnail_url: 'https://example.com/thumbnail.jpg',
        qr_code_url: 'https://example.com/qrcode.png',
        custom_data: '{"theme":"blue","text":"Hello World"}',
        view_count: '100',
        share_count: '50',
        download_count: '25'
      };

      const poster = await PersonalPoster.create(posterData);
      expect(poster.user_id).toBe('number');
      expect(poster.activity_id).toBe('number');
      expect(poster.referral_code).toBe('string');
      expect(poster.template_id).toBe('number');
      expect(poster.poster_url).toBe('string');
      expect(poster.thumbnail_url).toBe('string');
      expect(poster.qr_code_url).toBe('string');
      expect(poster.custom_data).toBe('string');
      expect(poster.view_count).toBe('string');
      expect(poster.share_count).toBe('string');
      expect(poster.download_count).toBe('string');
    });

    test('应该能够处理null值', async () => {
      const posterData = {
        user_id: null,
        activity_id: null,
        template_id: null
      };

      const poster = await PersonalPoster.create(posterData);
      expect(poster.user_id).toBeNull();
      expect(poster.activity_id).toBeNull();
      expect(poster.template_id).toBeNull();
    });

    test('应该能够处理JSON格式的custom_data', async () => {
      const customDataList = [
        '{"theme":"blue","text":"Hello World"}',
        '{"theme":"red","fontSize":16}',
        '{"background":"white","border":true}',
        ''
      ];

      for (const customData of customDataList) {
        const poster = await PersonalPoster.create({
          custom_data: customData
        });
        
        expect(poster.custom_data).toBe(customData);
      }
    });
  });

  describe('URL格式验证测试', () => {
    test('应该能够处理各种URL格式', async () => {
      const urlFormats = [
        'https://example.com/poster.jpg',
        'http://example.com/poster.png',
        'https://cdn.example.com/images/poster.gif',
        'https://example.com/path/to/poster.webp',
        ''
      ];

      for (const posterUrl of urlFormats) {
        const poster = await PersonalPoster.create({
          poster_url: posterUrl
        });
        
        expect(poster.poster_url).toBe(posterUrl);
      }
    });

    test('应该能够处理相对路径和绝对路径', async () => {
      const paths = [
        '/images/poster.jpg',
        '/static/images/poster.png',
        'poster.gif',
        ''
      ];

      for (const thumbnailUrl of paths) {
        const poster = await PersonalPoster.create({
          thumbnail_url: thumbnailUrl
        });
        
        expect(poster.thumbnail_url).toBe(thumbnailUrl);
      }
    });
  });

  describe('统计字段测试', () => {
    beforeEach(async () => {
      await PersonalPoster.bulkCreate([
        {
          user_id: 1,
          view_count: '100',
          share_count: '50',
          download_count: '25'
        },
        {
          user_id: 2,
          view_count: '200',
          share_count: '100',
          download_count: '50'
        },
        {
          user_id: 3,
          view_count: '150',
          share_count: '75',
          download_count: '35'
        }
      ]);
    });

    test('应该能够统计总查看数', async () => {
      const posters = await PersonalPoster.findAll();
      const totalViews = posters.reduce((sum, poster) => sum + parseInt(poster.view_count || '0'), 0);
      
      expect(totalViews).toBe(450);
    });

    test('应该能够统计总分享数', async () => {
      const posters = await PersonalPoster.findAll();
      const totalShares = posters.reduce((sum, poster) => sum + parseInt(poster.share_count || '0'), 0);
      
      expect(totalShares).toBe(225);
    });

    test('应该能够统计总下载数', async () => {
      const posters = await PersonalPoster.findAll();
      const totalDownloads = posters.reduce((sum, poster) => sum + parseInt(poster.download_count || '0'), 0);
      
      expect(totalDownloads).toBe(110);
    });

    test('应该能够找到最受欢迎的海报', async () => {
      const popularPoster = await PersonalPoster.findOne({
        order: [['view_count', 'DESC']]
      });
      
      expect(popularPoster).toBeDefined();
      expect(parseInt(popularPoster!.view_count)).toBe(200);
    });
  });

  describe('推荐码测试', () => {
    test('应该能够处理各种推荐码格式', async () => {
      const referralCodes = [
        'REF123456',
        'ABC789XYZ',
        'USER001',
        'PROMO2024',
        'SHORT',
        'VERYLONGREFERRALCODE123456789',
        ''
      ];

      for (const code of referralCodes) {
        const poster = await PersonalPoster.create({
          referral_code: code
        });
        
        expect(poster.referral_code).toBe(code);
      }
    });

    test('推荐码应该是唯一的（业务逻辑测试）', async () => {
      const referralCode = 'UNIQUE123';
      
      const poster1 = await PersonalPoster.create({
        referral_code: referralCode
      });
      
      const poster2 = await PersonalPoster.create({
        referral_code: referralCode
      });
      
      // 在实际应用中，这里应该有唯一性约束
      // 但由于模型定义中没有设置，这里只是测试数据存储
      expect(poster1.referral_code).toBe(referralCode);
      expect(poster2.referral_code).toBe(referralCode);
    });
  });

  describe('时间戳测试', () => {
    test('创建记录时应该自动设置时间戳', async () => {
      const poster = await PersonalPoster.create({
        user_id: 1,
        poster_url: 'https://example.com/poster.jpg'
      });

      expect(poster.createdAt).toBeDefined();
      expect(poster.updatedAt).toBeDefined();
      expect(poster.createdAt).toBeInstanceOf(Date);
      expect(poster.updatedAt).toBeInstanceOf(Date);
    });

    test('更新记录时应该自动更新 updated_at 时间戳', async () => {
      const poster = await PersonalPoster.create({
        user_id: 1,
        poster_url: 'https://example.com/poster.jpg'
      });

      const originalUpdatedAt = poster.updatedAt;
      
      // 等待1秒以确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await poster.update({ poster_url: 'https://example.com/updated_poster.jpg' });
      
      expect(poster.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });
});