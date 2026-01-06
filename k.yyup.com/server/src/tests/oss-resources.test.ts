/**
 * OSS资源访问单元测试
 * 验证所有OSS资源都能通过代理正常访问
 */

import request from 'supertest';
import { expect } from 'chai';
import { app } from '../app';
import { systemOSSService } from '../services/system-oss.service';

describe('OSS资源访问测试', () => {
  let testResults: any[] = [];
  let baseUrl: string;

  beforeEach(() => {
    baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  });

  describe('OSS服务状态检查', () => {
    it('OSS服务应该可用', () => {
      expect(systemOSSService.isAvailable()).to.be.true;
    });

    it('OSS配置应该正确', () => {
      expect(process.env.SYSTEM_OSS_BUCKET).to.equal('systemkarder');
      expect(process.env.SYSTEM_OSS_PATH_PREFIX).to.equal('kindergarten/');
      expect(process.env.SYSTEM_OSS_REGION).to.equal('oss-cn-guangzhou');
    });
  });

  describe('游戏资源测试', () => {
    const gameResources = [
      // BGM音频文件
      {
        type: 'audio',
        subType: 'bgm',
        files: [
          'animal-observer-bgm.mp3',
          'color-sorting-bgm.mp3',
          'dinosaur-memory-bgm.mp3',
          'dollhouse-bgm.mp3',
          'fruit-memory-bgm.mp3',
          'grid-memory-bgm.mp3',
          'princess-garden-bgm.mp3',
          'princess-memory-bgm.mp3',
          'robot-factory-bgm.mp3',
          'space-treasure-bgm.mp3'
        ]
      },
      // 音效文件
      {
        type: 'audio',
        subType: 'sfx',
        files: [
          'card-flip.mp3',
          'chime.mp3',
          'click.mp3',
          'combo.mp3',
          'correct.mp3',
          'countdown.mp3',
          'ding.mp3',
          'match.mp3',
          'pop.mp3',
          'scan.mp3'
        ]
      },
      // 语音文件
      {
        type: 'audio',
        subType: 'voices',
        files: [
          'color-sorting-game-start.mp3',
          'dollhouse-game-start.mp3',
          'dinosaur-memory-game-start.mp3',
          'fruit-memory-game-start.mp3',
          'grid-memory-game-start.mp3',
          'princess-garden-game-start.mp3',
          'princess-memory-game-start.mp3',
          'robot-factory-game-start.mp3',
          'space-treasure-game-start.mp3',
          'your-turn.mp3'
        ]
      },
      // 背景图片
      {
        type: 'images',
        subType: 'backgrounds',
        files: [
          'adventure-world/space-base.png',
          'adventure-world/space-base-1x1.png',
          'princess-garden/flower-garden.png',
          'princess-garden/flower-garden-1x1.png',
          'forest/sunny-meadow.png',
          'forest/deep-forest.png',
          'forest/riverside.png',
          'robot-factory/backgrounds/kitchen.png',
          'robot-factory/backgrounds/firestation.png',
          'robot-factory/backgrounds/hospital.png'
        ]
      },
      // 场景图片
      {
        type: 'images',
        subType: 'scenes',
        files: [
          'adventure-world/space-base.png',
          'adventure-world/space-base-1x1.png',
          'forest/sunny-meadow.png',
          'forest/deep-forest.png',
          'forest/riverside.png',
          'princess-garden/princess-castle.png',
          'princess-garden/flower-garden.png',
          'princess-garden/tea-party-base.png',
          'space-treasure/space-station-1.png',
          'space-treasure/moon-base.png'
        ]
      },
      // 道具图片
      {
        type: 'images',
        subType: 'items',
        files: [
          'fruits/apple.png',
          'fruits/banana.png',
          'fruits/cherry.png',
          'fruits/grape.png',
          'fruits/orange.png',
          'fruits/pear.png',
          'fruits/strawberry.png',
          'fruits/watermelon.png',
          'space-items/alien.png',
          'space-items/antenna.png'
        ]
      },
      // 背篮图片
      {
        type: 'images',
        subType: 'baskets',
        files: [
          'red-basket.png',
          'orange-basket.png',
          'yellow-basket.png',
          'green-basket.png',
          'blue-basket.png',
          'purple-basket.png',
          'brown-basket.png',
          'pink-basket.png',
          'gray-basket.png',
          'black-basket.png'
        ]
      }
    ];

    gameResources.forEach((resourceGroup) => {
      describe(`游戏${resourceGroup.type === 'audio' ? '音频' : '图片'}资源 - ${resourceGroup.subType}`, () => {
        resourceGroup.files.forEach((filename) => {
          it(`应该能访问 ${resourceGroup.type}/${resourceGroup.subType}/${filename}`, async () => {
            const url = `/api/oss-proxy/games/${resourceGroup.type}/${resourceGroup.subType}/${filename}`;

            try {
              const response = await request(app)
                .get(url)
                .expect(302); // 期望重定向到OSS签名URL

              // 验证重定向Location包含签名参数
              const location = response.headers.location;
              expect(location).to.include('OSSAccessKeyId');
              expect(location).to.include('Expires');
              expect(location).to.include('Signature');

              testResults.push({
                type: 'game',
                category: resourceGroup.type,
                subType: resourceGroup.subType,
                filename,
                url,
                status: 'success',
                redirectLocation: location
              });

              console.log(`✅ 游戏资源访问成功: ${url}`);
            } catch (error) {
              testResults.push({
                type: 'game',
                category: resourceGroup.type,
                subType: resourceGroup.subType,
                filename,
                url,
                status: 'error',
                error: (error as any).message
              });

              console.log(`❌ 游戏资源访问失败: ${url} - ${(error as any).message}`);
              throw error;
            }
          });
        });
      });
    });
  });

  describe('教育资源测试', () => {
    const educationResources = [
      // 测评音频
      {
        category: 'assessment',
        subType: 'audio',
        files: [
          'q1_attention_24-36.mp3',
          'q2_attention_24-36.mp3',
          'q3_attention_24-36.mp3',
          'q4_attention_24-36.mp3',
          'q5_attention_24-36.mp3',
          'q6_attention_36-48.mp3',
          'q7_attention_36-48.mp3',
          'q8_attention_36-48.mp3',
          'q9_attention_36-48.mp3',
          'q10_attention_36-48.mp3'
        ]
      },
      // 测评图片
      {
        category: 'assessment',
        subType: 'images',
        files: [
          'attention_24-36.jpg',
          'attention_36-48.jpg',
          'attention_48-60.jpg',
          'attention_60-72.jpg',
          'language_24-36.jpg',
          'language_36-48.jpg',
          'language_48-60.jpg',
          'language_60-66.jpg',
          'language_66-72.jpg',
          'language_72-78.jpg'
        ]
      },
      // 活动图片
      {
        category: 'activities',
        subType: '',
        files: [
          'autumn_outing.jpg',
          'family_sports_day.jpg',
          'fruit_picking.jpg',
          'handcraft_workshop.jpg',
          'spring_picnic.jpg',
          'winter_festival.jpg'
        ]
      }
    ];

    educationResources.forEach((resourceGroup) => {
      const subTypePath = resourceGroup.subType ? `${resourceGroup.subType}/` : '';

      describe(`教育资源 - ${resourceGroup.category}${resourceGroup.subType ? '/' + resourceGroup.subType : ''}`, () => {
        resourceGroup.files.forEach((filename) => {
          it(`应该能访问 education/${resourceGroup.category}/${subTypePath}${filename}`, async () => {
            const url = `/api/oss-proxy/education/${resourceGroup.category}/${subTypePath}${filename}`;

            try {
              const response = await request(app)
                .get(url)
                .expect(302);

              const location = response.headers.location;
              expect(location).to.include('OSSAccessKeyId');

              testResults.push({
                type: 'education',
                category: resourceGroup.category,
                subType: resourceGroup.subType,
                filename,
                url,
                status: 'success',
                redirectLocation: location
              });

              console.log(`✅ 教育资源访问成功: ${url}`);
            } catch (error) {
              testResults.push({
                type: 'education',
                category: resourceGroup.category,
                subType: resourceGroup.subType,
                filename,
                url,
                status: 'error',
                error: (error as any).message
              });

              console.log(`❌ 教育资源访问失败: ${url} - ${(error as any).message}`);
              throw error;
            }
          });
        });
      });
    });
  });

  describe('开发资源测试', () => {
    const developmentResources = [
      // AI助手图标
      {
        category: 'icons',
        subType: '',
        files: [
          'ai-robot-avatar.png',
          'chat-conversation-icon.png',
          'user-parent-avatar.png'
        ]
      }
    ];

    developmentResources.forEach((resourceGroup) => {
      const subTypePath = resourceGroup.subType ? `${resourceGroup.subType}/` : '';

      describe(`开发资源 - ${resourceGroup.category}`, () => {
        resourceGroup.files.forEach((filename) => {
          it(`应该能访问 development/${resourceGroup.category}/${subTypePath}${filename}`, async () => {
            const url = `/api/oss-proxy/development/${resourceGroup.category}/${subTypePath}${filename}`;

            try {
              const response = await request(app)
                .get(url)
                .expect(302);

              const location = response.headers.location;
              expect(location).to.include('OSSAccessKeyId');

              testResults.push({
                type: 'development',
                category: resourceGroup.category,
                subType: resourceGroup.subType,
                filename,
                url,
                status: 'success',
                redirectLocation: location
              });

              console.log(`✅ 开发资源访问成功: ${url}`);
            } catch (error) {
              testResults.push({
                type: 'development',
                category: resourceGroup.category,
                subType: resourceGroup.subType,
                filename,
                url,
                status: 'error',
                error: (error as any).message
              });

              console.log(`❌ 开发资源访问失败: ${url} - ${(error as any).message}`);
              throw error;
            }
          });
        });
      });
    });
  });

  describe('批量资源测试', () => {
    it('应该能批量获取多个资源URL', async () => {
      const testFiles = [
        { path: 'games/audio/bgm/animal-observer-bgm.mp3' },
        { path: 'games/images/items/fruits/apple.png' },
        { path: 'education/assessment/audio/q1_attention_24-36.mp3' },
        { path: 'education/assessment/images/attention_24-36.jpg' },
        { path: 'development/icons/ai-robot-avatar.png' }
      ];

      const response = await request(app)
        .post('/api/oss-proxy/batch')
        .send({ files: testFiles })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.files).to.have.length(5);
      expect(response.body.data.successful).to.equal(5);
      expect(response.body.data.failed).to.equal(0);

      // 验证每个返回的文件都有签名URL
      response.body.data.files.forEach((file: any) => {
        expect(file.signedUrl).to.include('OSSAccessKeyId');
        expect(file.exists).to.be.true;
      });
    });
  });

  describe('错误处理测试', () => {
    it('不存在的文件应该返回404', async () => {
      await request(app)
        .get('/api/oss-proxy/games/audio/bgm/nonexistent-file.mp3')
        .expect(404);
    });

    it('无效路径应该返回404', async () => {
      await request(app)
        .get('/api/oss-proxy/invalid/path/file.mp3')
        .expect(404);
    });

    it('批量请求空数组应该返回400', async () => {
      await request(app)
        .post('/api/oss-proxy/batch')
        .send({ files: [] })
        .expect(400);
    });
  });

  afterAll(() => {
    // 生成测试报告
    generateTestReport(testResults);
  });
});

// 生成测试报告
function generateTestReport(results: any[]): void {
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.status === 'success').length;
  const failedTests = results.filter(r => r.status === 'error').length;
  const successRate = ((successfulTests / totalTests) * 100).toFixed(2);

  const report = `
# OSS资源访问测试报告

## 测试概览
- **测试时间**: ${new Date().toLocaleString()}
- **总测试数**: ${totalTests}
- **成功测试**: ${successfulTests}
- **失败测试**: ${failedTests}
- **成功率**: ${successRate}%

## 分类统计

### 游戏资源
${generateCategoryReport(results.filter(r => r.type === 'game'))}

### 教育资源
${generateCategoryReport(results.filter(r => r.type === 'education'))}

### 开发资源
${generateCategoryReport(results.filter(r => r.type === 'development'))}

## 失败测试详情
${generateFailureReport(results.filter(r => r.status === 'error'))}

## 测试结果说明
- ✅ **成功**: 资源可通过代理正常访问，返回OSS签名URL
- ❌ **失败**: 资源无法访问，可能原因：
  - 文件不存在于OSS
  - OSS权限配置问题
  - 网络连接问题
  - 代理服务错误

## 建议
1. 检查失败的资源是否确实需要
2. 确认OSS bucket权限配置正确
3. 验证环境变量配置
4. 检查代理服务日志

---
*报告生成时间: ${new Date().toLocaleString()}*
`;

  try {
    const fs = require('fs');
    const path = require('path');

    const reportPath = path.join(__dirname, '../../test-reports', 'oss-resources-test-report.md');

    // 确保目录存在
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, report);
    console.log('\n📊 测试报告已生成:', reportPath);
  } catch (error) {
    console.error('生成测试报告失败:', error);
  }
}

function generateCategoryReport(categoryResults: any[]): string {
  if (categoryResults.length === 0) {
    return '无测试数据';
  }

  const categoryGroups = categoryResults.reduce((acc: any, result) => {
    const key = `${result.category}${result.subType ? '/' + result.subType : ''}`;
    if (!acc[key]) {
      acc[key] = { total: 0, success: 0, failed: 0 };
    }
    acc[key].total++;
    if (result.status === 'success') {
      acc[key].success++;
    } else {
      acc[key].failed++;
    }
    return acc;
  }, {});

  return Object.entries(categoryGroups)
    .map(([category, stats]: [string, any]) => {
      const rate = ((stats.success / stats.total) * 100).toFixed(2);
      return `- **${category}**: ${stats.success}/${stats.total} (${rate}%)`;
    })
    .join('\n');
}

function generateFailureReport(failedResults: any[]): string {
  if (failedResults.length === 0) {
    return '✅ 所有测试都通过了！';
  }

  return failedResults
    .map(result => `- **${result.url}**: ${result.error}`)
    .join('\n');
}