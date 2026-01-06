#!/usr/bin/env node

const axios = require('axios');

async function simulateFrontendAPI() {
  console.log('🚀 模拟前端API调用测试...');
  
  try {
    // 1. 先登录获取token
    console.log('🔐 步骤1: 登录获取token...');
    const loginResponse = await axios.post('http://localhost:5173/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log(`✅ 登录成功! 用户: ${user.username}, 角色: ${user.role}`);
    console.log(`🔑 Token: ${token.substring(0, 50)}...`);
    
    // 2. 使用token调用活动API
    console.log('\n📋 步骤2: 调用活动列表API...');
    const activityResponse = await axios.get('http://localhost:5173/api/activities', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!activityResponse.data.success) {
      throw new Error('获取活动列表失败: ' + activityResponse.data.message);
    }
    
    const activities = activityResponse.data.data;
    console.log(`✅ 活动列表获取成功!`);
    console.log(`📊 总数: ${activities.total}`);
    console.log(`📄 当前页: ${activities.page}/${activities.totalPages}`);
    console.log(`📝 每页: ${activities.pageSize}`);
    console.log(`🎯 活动数量: ${activities.items.length}`);
    
    if (activities.items.length > 0) {
      const firstActivity = activities.items[0];
      console.log('\n🎪 第一个活动信息:');
      console.log(`  ID: ${firstActivity.id}`);
      console.log(`  标题: ${firstActivity.title}`);
      console.log(`  开始时间(原始): ${firstActivity.start_time}`);
      console.log(`  结束时间(原始): ${firstActivity.end_time}`);
      console.log(`  地点: ${firstActivity.location}`);
      console.log(`  状态: ${firstActivity.status}`);
      
      // 检查是否有转换后的字段
      if (firstActivity.startTime) {
        console.log(`  开始时间(转换): ${firstActivity.startTime}`);
      }
      if (firstActivity.endTime) {
        console.log(`  结束时间(转换): ${firstActivity.endTime}`);
      }
    }
    
    // 3. 测试数据转换
    console.log('\n🔄 步骤3: 测试数据转换...');
    const transformedActivities = activities.items.map(item => {
      // 模拟前端的数据转换逻辑
      return {
        ...item,
        activityType: item.activity_type,
        coverImage: item.cover_image,
        startTime: item.start_time,
        endTime: item.end_time,
        registrationStartTime: item.registration_start_time,
        registrationEndTime: item.registration_end_time,
        needsApproval: item.needs_approval,
        registeredCount: item.registered_count,
        kindergartenId: item.kindergarten_id,
        planId: item.plan_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };
    });
    
    if (transformedActivities.length > 0) {
      const transformed = transformedActivities[0];
      console.log('✅ 数据转换成功!');
      console.log(`  转换后开始时间: ${transformed.startTime}`);
      console.log(`  转换后结束时间: ${transformed.endTime}`);
      
      // 测试时间格式化
      const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            return '-';
          }
          
          return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
        } catch (error) {
          return '-';
        }
      };
      
      console.log(`  格式化开始时间: ${formatDateTime(transformed.startTime)}`);
      console.log(`  格式化结束时间: ${formatDateTime(transformed.endTime)}`);
    }
    
    console.log('\n🎉 所有测试通过! 前端API调用正常工作');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
simulateFrontendAPI().catch(console.error);
