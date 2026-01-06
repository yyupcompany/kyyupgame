/**
 * 测试教学中心API接口
 * 验证园长和老师角色看到的数据是否一致
 */

const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const API_BASE_URL = 'http://localhost:3000';

// 测试用户凭据
const PRINCIPAL_CREDENTIALS = {
  username: 'principal',
  password: 'principal123'
};

const TEACHER_CREDENTIALS = {
  username: 'teacher',
  password: 'teacher123'
};

// 登录函数
async function login(credentials) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    if (response.data.success && response.data.data.token) {
      return response.data.data.token;
    }
    throw new Error('登录失败');
  } catch (error) {
    console.error(`登录失败 (${credentials.username}):`, error.response?.data || error.message);
    return null;
  }
}

// 获取课程进度统计
async function getCourseProgressStats(token, role) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/teaching-center/course-progress`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`\n📚 ${role}角色 - 课程进度统计:`);
    if (response.data.success) {
      const data = response.data.data;
      console.log(`  - 总体完成率: ${data.overall_stats?.overall_completion_rate || 0}%`);
      console.log(`  - 总体达标率: ${data.overall_stats?.overall_achievement_rate || 0}%`);
      console.log(`  - 课程计划数: ${data.course_plan_stats?.length || 0}`);
      
      if (data.course_plan_stats && data.course_plan_stats.length > 0) {
        console.log(`  - 前3个课程计划:`);
        data.course_plan_stats.slice(0, 3).forEach(plan => {
          console.log(`    * ${plan.course?.course_name} - ${plan.class?.name} - 完成率: ${plan.completion_rate}%`);
        });
      }
      
      return data;
    } else {
      console.log(`  ❌ 获取失败: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.error(`  ❌ 请求失败:`, error.response?.data || error.message);
    return null;
  }
}

// 获取户外训练统计
async function getOutdoorTrainingStats(token, role) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/teaching-center/outdoor-training`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`\n🏃 ${role}角色 - 户外训练统计:`);
    if (response.data.success) {
      const data = response.data.data;
      console.log(`  - 总体完成率: ${data.overview?.overall_completion_rate || 0}%`);
      console.log(`  - 总体达标率: ${data.overview?.overall_achievement_rate || 0}%`);
      console.log(`  - 已完成周数: ${data.overview?.completed_weeks || 0}/16`);
      console.log(`  - 班级数据数: ${data.class_stats?.length || 0}`);
      
      if (data.class_stats && data.class_stats.length > 0) {
        console.log(`  - 前3个班级:`);
        data.class_stats.slice(0, 3).forEach(cls => {
          console.log(`    * ${cls.class_name} - 完成周数: ${cls.completed_weeks}/16 - 达标率: ${cls.achievement_rate}%`);
        });
      }
      
      return data;
    } else {
      console.log(`  ❌ 获取失败: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.error(`  ❌ 请求失败:`, error.response?.data || error.message);
    return null;
  }
}

// 获取校外展示统计
async function getExternalDisplayStats(token, role) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/teaching-center/external-display`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`\n🎭 ${role}角色 - 校外展示统计:`);
    if (response.data.success) {
      const data = response.data.data;
      console.log(`  - 总体达标率: ${data.overview?.average_achievement_rate || 0}%`);
      console.log(`  - 本学期外出次数: ${data.overview?.semester_total_outings || 0}`);
      console.log(`  - 班级数据数: ${data.class_stats?.length || 0}`);
      
      if (data.class_stats && data.class_stats.length > 0) {
        console.log(`  - 前3个班级:`);
        data.class_stats.slice(0, 3).forEach(cls => {
          console.log(`    * ${cls.class_name} - 外出次数: ${cls.total_outings} - 达标率: ${cls.achievement_rate}%`);
        });
      }
      
      return data;
    } else {
      console.log(`  ❌ 获取失败: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.error(`  ❌ 请求失败:`, error.response?.data || error.message);
    return null;
  }
}

// 获取锦标赛统计
async function getChampionshipStats(token, role) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/teaching-center/championship`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`\n🏆 ${role}角色 - 锦标赛统计:`);
    if (response.data.success) {
      const data = response.data.data;
      console.log(`  - 脑科学计划达标率: ${data.achievement_rates?.brain_science_plan || 0}%`);
      console.log(`  - 课程内容达标率: ${data.achievement_rates?.course_content || 0}%`);
      console.log(`  - 户外训练达标率: ${data.achievement_rates?.outdoor_training || 0}%`);
      console.log(`  - 校外展示达标率: ${data.achievement_rates?.external_display || 0}%`);
      console.log(`  - 总体达标率: ${data.achievement_rates?.overall || 0}%`);
      
      return data;
    } else {
      console.log(`  ❌ 获取失败: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.error(`  ❌ 请求失败:`, error.response?.data || error.message);
    return null;
  }
}

// 比对数据
function compareData(principalData, teacherData, dataType) {
  console.log(`\n🔍 比对${dataType}数据:`);
  
  if (!principalData || !teacherData) {
    console.log(`  ⚠️  无法比对 - 数据缺失`);
    return;
  }
  
  // 简单的深度比较
  const principalStr = JSON.stringify(principalData);
  const teacherStr = JSON.stringify(teacherData);
  
  if (principalStr === teacherStr) {
    console.log(`  ✅ 数据完全一致`);
  } else {
    console.log(`  ⚠️  数据存在差异`);
    console.log(`  - 园长数据大小: ${principalStr.length} 字符`);
    console.log(`  - 老师数据大小: ${teacherStr.length} 字符`);
    
    // 检查关键字段
    if (dataType === '课程进度') {
      const pRate = principalData.overall_stats?.overall_completion_rate || 0;
      const tRate = teacherData.overall_stats?.overall_completion_rate || 0;
      console.log(`  - 总体完成率: 园长=${pRate}%, 老师=${tRate}%`);
    }
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试教学中心API接口...\n');
  console.log(`API地址: ${API_BASE_URL}`);
  
  // 1. 登录园长账号
  console.log('\n1️⃣ 登录园长账号...');
  const principalToken = await login(PRINCIPAL_CREDENTIALS);
  if (!principalToken) {
    console.error('❌ 园长登录失败，测试终止');
    return;
  }
  console.log('✅ 园长登录成功');
  
  // 2. 登录老师账号
  console.log('\n2️⃣ 登录老师账号...');
  const teacherToken = await login(TEACHER_CREDENTIALS);
  if (!teacherToken) {
    console.error('❌ 老师登录失败，测试终止');
    return;
  }
  console.log('✅ 老师登录成功');
  
  // 3. 测试课程进度API
  console.log('\n3️⃣ 测试课程进度API...');
  const principalCourseData = await getCourseProgressStats(principalToken, '园长');
  const teacherCourseData = await getCourseProgressStats(teacherToken, '老师');
  compareData(principalCourseData, teacherCourseData, '课程进度');
  
  // 4. 测试户外训练API
  console.log('\n4️⃣ 测试户外训练API...');
  const principalOutdoorData = await getOutdoorTrainingStats(principalToken, '园长');
  const teacherOutdoorData = await getOutdoorTrainingStats(teacherToken, '老师');
  compareData(principalOutdoorData, teacherOutdoorData, '户外训练');
  
  // 5. 测试校外展示API
  console.log('\n5️⃣ 测试校外展示API...');
  const principalDisplayData = await getExternalDisplayStats(principalToken, '园长');
  const teacherDisplayData = await getExternalDisplayStats(teacherToken, '老师');
  compareData(principalDisplayData, teacherDisplayData, '校外展示');
  
  // 6. 测试锦标赛API
  console.log('\n6️⃣ 测试锦标赛API...');
  const principalChampData = await getChampionshipStats(principalToken, '园长');
  const teacherChampData = await getChampionshipStats(teacherToken, '老师');
  compareData(principalChampData, teacherChampData, '锦标赛');
  
  console.log('\n✅ 测试完成！');
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});

