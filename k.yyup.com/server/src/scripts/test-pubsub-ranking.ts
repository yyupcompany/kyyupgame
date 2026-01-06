/**
 * Pub/Sub和排行榜功能测试
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 环境变量加载完成\n');

import RedisService from '../services/redis.service';
import PubSubService, { PubSubChannels } from '../services/pubsub.service';
import RankingService, { RankingKeys } from '../services/ranking.service';
import { sequelize } from '../database';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPubSubAndRanking() {
  console.log('🚀 开始Pub/Sub和排行榜功能测试...\n');

  try {
    // 连接数据库和Redis
    console.log('📝 测试0: 连接数据库和Redis');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    await RedisService.connect();
    console.log('✅ Redis连接成功\n');

    // ==================== Pub/Sub测试 ====================

    // 测试1: 订阅频道
    console.log('📝 测试1: 订阅频道');
    let receivedMessages: any[] = [];
    
    await PubSubService.subscribe(PubSubChannels.SYSTEM_NOTIFICATION, (message, channel) => {
      console.log(`   📥 收到消息 [${channel}]:`, message);
      receivedMessages.push(message);
    });
    
    console.log('✅ 已订阅系统通知频道\n');
    
    // 等待订阅生效
    await sleep(100);

    // 测试2: 发布消息
    console.log('📝 测试2: 发布消息');
    const message1 = {
      type: 'info',
      title: '系统通知',
      content: '这是一条测试消息',
      timestamp: new Date().toISOString()
    };
    
    const receivers1 = await PubSubService.publish(PubSubChannels.SYSTEM_NOTIFICATION, message1);
    console.log(`   接收者数量: ${receivers1}`);
    
    await sleep(100);
    console.log(`   已接收消息数: ${receivedMessages.length}`);
    console.log('✅ 消息发布成功\n');

    // 测试3: 多条消息发布
    console.log('📝 测试3: 多条消息发布');
    for (let i = 1; i <= 3; i++) {
      await PubSubService.publish(PubSubChannels.SYSTEM_NOTIFICATION, {
        type: 'info',
        title: `消息${i}`,
        content: `这是第${i}条消息`
      });
      await sleep(50);
    }
    
    await sleep(100);
    console.log(`   已接收消息数: ${receivedMessages.length}`);
    console.log('✅ 多条消息发布成功\n');

    // 测试4: Pub/Sub统计
    console.log('📝 测试4: Pub/Sub统计');
    const stats = PubSubService.getStats();
    console.log(`   总发布: ${stats.totalPublished}`);
    console.log(`   总接收: ${stats.totalReceived}`);
    console.log(`   活跃订阅: ${stats.activeSubscriptions}`);
    console.log(`   频道列表: ${stats.channels.join(', ')}`);
    console.log('✅ Pub/Sub统计正常\n');

    // 测试5: 取消订阅
    console.log('📝 测试5: 取消订阅');
    await PubSubService.unsubscribe(PubSubChannels.SYSTEM_NOTIFICATION);
    console.log('✅ 已取消订阅\n');

    // ==================== 排行榜测试 ====================

    // 测试6: 更新排行榜分数
    console.log('📝 测试6: 更新排行榜分数');
    const rankingKey = 'test:ranking:students';
    
    await RankingService.updateScore(rankingKey, 'student:1', 95);
    await RankingService.updateScore(rankingKey, 'student:2', 88);
    await RankingService.updateScore(rankingKey, 'student:3', 92);
    await RankingService.updateScore(rankingKey, 'student:4', 85);
    await RankingService.updateScore(rankingKey, 'student:5', 90);
    
    console.log('✅ 排行榜分数已更新\n');

    // 测试7: 获取排行榜（前3名）
    console.log('📝 测试7: 获取排行榜（前3名）');
    const top3 = await RankingService.getTopRanking(rankingKey, 0, 2);
    console.log('   排行榜:');
    top3.forEach(item => {
      console.log(`     ${item.rank}. ${item.id}: ${item.score}分`);
    });
    console.log('✅ 排行榜获取成功\n');

    // 测试8: 获取成员排名和分数
    console.log('📝 测试8: 获取成员排名和分数');
    const rank = await RankingService.getRank(rankingKey, 'student:3');
    const score = await RankingService.getScore(rankingKey, 'student:3');
    console.log(`   student:3 排名: ${rank}, 分数: ${score}`);
    console.log('✅ 成员信息获取成功\n');

    // 测试9: 增加分数
    console.log('📝 测试9: 增加分数');
    const newScore = await RankingService.incrementScore(rankingKey, 'student:2', 5);
    console.log(`   student:2 新分数: ${newScore}`);
    
    const newRank = await RankingService.getRank(rankingKey, 'student:2');
    console.log(`   student:2 新排名: ${newRank}`);
    console.log('✅ 分数增加成功\n');

    // 测试10: 获取排行榜总数
    console.log('📝 测试10: 获取排行榜总数');
    const count = await RankingService.getCount(rankingKey);
    console.log(`   排行榜总数: ${count}`);
    console.log('✅ 总数获取成功\n');

    // 测试11: 业务排行榜 - 活动报名
    console.log('📝 测试11: 业务排行榜 - 活动报名');
    const activityId = 1;
    
    // 模拟5个学生报名
    for (let i = 1; i <= 5; i++) {
      await RankingService.updateActivityRegistrationRanking(activityId, i);
      await sleep(10);  // 确保时间戳不同
    }
    
    const activityRanking = await RankingService.getActivityRegistrationRanking(activityId, 5);
    console.log('   活动报名排行榜:');
    activityRanking.forEach(item => {
      console.log(`     ${item.rank}. ${item.id} (报名时间戳: ${item.score})`);
    });
    console.log('✅ 活动报名排行榜测试成功\n');

    // 测试12: 业务排行榜 - 学生积分
    console.log('📝 测试12: 业务排行榜 - 学生积分');
    
    await RankingService.updateStudentPointsRanking(1, 1500);
    await RankingService.updateStudentPointsRanking(2, 1200);
    await RankingService.updateStudentPointsRanking(3, 1800);
    await RankingService.updateStudentPointsRanking(4, 1000);
    await RankingService.updateStudentPointsRanking(5, 1600);
    
    const pointsRanking = await RankingService.getStudentPointsRanking(3);
    console.log('   学生积分排行榜（前3名）:');
    pointsRanking.forEach(item => {
      console.log(`     ${item.rank}. ${item.id}: ${item.score}积分`);
    });
    console.log('✅ 学生积分排行榜测试成功\n');

    // 测试13: 业务排行榜 - 教师评分
    console.log('📝 测试13: 业务排行榜 - 教师评分');
    
    await RankingService.updateTeacherRatingRanking(1, 4.8);
    await RankingService.updateTeacherRatingRanking(2, 4.5);
    await RankingService.updateTeacherRatingRanking(3, 4.9);
    await RankingService.updateTeacherRatingRanking(4, 4.3);
    
    const ratingRanking = await RankingService.getTeacherRatingRanking(3);
    console.log('   教师评分排行榜（前3名）:');
    ratingRanking.forEach(item => {
      console.log(`     ${item.rank}. ${item.id}: ${item.score}分`);
    });
    console.log('✅ 教师评分排行榜测试成功\n');

    // 测试14: 按分数范围查询
    console.log('📝 测试14: 按分数范围查询');
    const rangeResults = await RankingService.getRangeByScore(rankingKey, 85, 92);
    console.log(`   分数在85-92之间的成员 (${rangeResults.length}个):`);
    rangeResults.forEach(item => {
      console.log(`     ${item.id}: ${item.score}分`);
    });
    console.log('✅ 按分数范围查询成功\n');

    // 测试15: 删除成员
    console.log('📝 测试15: 删除成员');
    await RankingService.removeMember(rankingKey, 'student:4');
    const countAfterRemove = await RankingService.getCount(rankingKey);
    console.log(`   删除后排行榜总数: ${countAfterRemove}`);
    console.log('✅ 成员删除成功\n');

    console.log('🎉 所有测试完成！');

  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    // 清理测试数据
    console.log('\n📝 清理测试数据...');
    
    // 清理排行榜
    await RankingService.clear('test:ranking:students');
    await RankingService.clear(RankingKeys.ACTIVITY_REGISTRATION(1));
    await RankingService.clear(RankingKeys.STUDENT_POINTS);
    await RankingService.clear(RankingKeys.TEACHER_RATING);
    
    // 断开Pub/Sub
    await PubSubService.disconnect();
    
    console.log('✅ 测试数据已清理');
    
    // 断开连接
    await RedisService.disconnect();
    await sequelize.close();
    console.log('👋 连接已关闭');
    process.exit(0);
  }
}

// 运行测试
testPubSubAndRanking();

