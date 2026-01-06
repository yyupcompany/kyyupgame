const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const TEACHER_USERNAME = 'test_teacher';
const TEACHER_PASSWORD = 'admin123';
const PRINCIPAL_USERNAME = 'test_admin';
const PRINCIPAL_PASSWORD = 'admin123';

async function testTeachingCenter(role = 'teacher') {
  console.log('\n' + '='.repeat(70));
  console.log(`🎯 教学中心测试 - ${role === 'teacher' ? '教师角色' : '园长角色'}`);
  console.log('='.repeat(70) + '\n');

  try {
    // 步骤1: 登录
    console.log(`📍 步骤1: ${role === 'teacher' ? '教师' : '园长'}登录`);
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: role === 'teacher' ? TEACHER_USERNAME : PRINCIPAL_USERNAME,
      password: role === 'teacher' ? TEACHER_PASSWORD : PRINCIPAL_PASSWORD
    });

    if (!loginResponse.data.success) {
      console.log('❌ 登录失败:', loginResponse.data.message);
      return;
    }

    const authToken = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ 登录成功！');
    console.log(`   用户ID: ${user.id}`);
    console.log(`   用户名: ${user.username}`);
    console.log(`   角色: ${user.role}`);

    // 步骤2: 获取课程进度统计
    console.log('\n📍 步骤2: 获取课程进度统计');
    try {
      const statsResponse = await axios.get(
        `${API_BASE_URL}/teaching-center/course-progress`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      if (statsResponse.data.success) {
        const stats = statsResponse.data.data;
        console.log('✅ 课程进度统计获取成功！');
        console.log(`   数据结构:`, JSON.stringify(stats, null, 2).substring(0, 500));
      } else {
        console.log('⚠️  课程进度统计API返回失败:', statsResponse.data.message);
      }
    } catch (error) {
      console.log('⚠️  课程进度统计API出错:', error.response?.status || error.message);
      if (error.response?.data) {
        console.log('   错误详情:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // 步骤3: 获取班级列表
    console.log('\n📍 步骤3: 获取班级列表');
    try {
      const classesResponse = await axios.get(
        `${API_BASE_URL}/teaching-center/classes`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: { page: 1, pageSize: 10 }
        }
      );

      if (classesResponse.data.success) {
        const data = classesResponse.data.data;
        const classes = data.list || data.classes || data;
        
        console.log('✅ 班级列表获取成功！');
        console.log(`   班级数量: ${Array.isArray(classes) ? classes.length : 0}`);
        console.log(`   总记录数: ${data.total || 0}`);
        
        if (Array.isArray(classes) && classes.length > 0) {
          console.log('\n   班级列表:');
          classes.forEach((cls, index) => {
            console.log(`   ${index + 1}. ${cls.name || cls.class_name || '未命名班级'}`);
            console.log(`      年级: ${cls.grade || '未知'}, 学生数: ${cls.student_count || cls.studentCount || 0}`);
            console.log(`      班主任: ${cls.head_teacher || cls.headTeacher || '未分配'}`);
          });
        } else {
          console.log('   ⚠️  暂无班级数据');
        }
      } else {
        console.log('⚠️  班级列表API返回失败:', classesResponse.data.message);
      }
    } catch (error) {
      console.log('⚠️  班级列表API不存在或出错:', error.response?.status || error.message);
    }

    // 步骤4: 尝试通用班级API
    console.log('\n📍 步骤4: 尝试通用班级API');
    try {
      const generalClassesResponse = await axios.get(
        `${API_BASE_URL}/classes`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: { page: 1, pageSize: 10 }
        }
      );

      if (generalClassesResponse.data.success) {
        const data = generalClassesResponse.data.data;
        const classes = data.list || data.classes || data;
        
        console.log('✅ 通用班级API可用！');
        console.log(`   班级数量: ${Array.isArray(classes) ? classes.length : 0}`);
        console.log(`   总记录数: ${data.total || 0}`);
        
        if (role === 'teacher') {
          console.log(`   ⚠️  教师应该只能看到自己负责的班级`);
        } else {
          console.log(`   ✅ 园长可以看到所有班级`);
        }
      } else {
        console.log('⚠️  通用班级API返回失败:', generalClassesResponse.data.message);
      }
    } catch (error) {
      console.log('⚠️  通用班级API不存在或出错:', error.response?.status || error.message);
    }

    // 步骤5: 获取学生列表
    console.log('\n📍 步骤5: 获取学生列表');
    try {
      const studentsResponse = await axios.get(
        `${API_BASE_URL}/teaching-center/students`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: { page: 1, pageSize: 10 }
        }
      );

      if (studentsResponse.data.success) {
        const data = studentsResponse.data.data;
        const students = data.list || data.students || data;
        
        console.log('✅ 学生列表获取成功！');
        console.log(`   学生数量: ${Array.isArray(students) ? students.length : 0}`);
        console.log(`   总记录数: ${data.total || 0}`);
        
        if (Array.isArray(students) && students.length > 0) {
          console.log('\n   前5个学生:');
          students.slice(0, 5).forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.name || student.student_name || '未命名'}`);
            console.log(`      班级: ${student.class_name || student.className || '未分配'}`);
          });
        }
      } else {
        console.log('⚠️  学生列表API返回失败:', studentsResponse.data.message);
      }
    } catch (error) {
      console.log('⚠️  学生列表API不存在或出错:', error.response?.status || error.message);
    }

    // 步骤6: 获取课程安排
    console.log('\n📍 步骤6: 获取课程安排');
    try {
      const coursesResponse = await axios.get(
        `${API_BASE_URL}/teaching-center/courses`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: { page: 1, pageSize: 10 }
        }
      );

      if (coursesResponse.data.success) {
        const data = coursesResponse.data.data;
        const courses = data.list || data.courses || data;
        
        console.log('✅ 课程安排获取成功！');
        console.log(`   课程数量: ${Array.isArray(courses) ? courses.length : 0}`);
        console.log(`   总记录数: ${data.total || 0}`);
      } else {
        console.log('⚠️  课程安排API返回失败:', coursesResponse.data.message);
      }
    } catch (error) {
      console.log('⚠️  课程安排API不存在或出错:', error.response?.status || error.message);
    }

    // 步骤7: 检查可用的教学中心API
    console.log('\n📍 步骤7: 检查可用的教学中心API');
    const teachingEndpoints = [
      '/teaching-center/course-progress',
      '/teaching-center/outdoor-training',
      '/teaching-center/championship-participation',
      '/teaching-center/class-list',
      '/classes',
      '/students'
    ];

    for (const endpoint of teachingEndpoints) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}${endpoint}`,
          {
            headers: { 'Authorization': `Bearer ${authToken}` },
            params: { page: 1, pageSize: 5 }
          }
        );

        if (response.data.success) {
          const data = response.data.data;
          const count = Array.isArray(data) ? data.length : 
                       (data.list?.length || data.classes?.length || data.students?.length || 0);
          console.log(`   ✅ ${endpoint}: 可用 (${count}条数据)`);
        } else {
          console.log(`   ⚠️  ${endpoint}: 返回失败`);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   ❌ ${endpoint}: 不存在`);
        } else {
          console.log(`   ⚠️  ${endpoint}: 错误 (${error.response?.status || error.message})`);
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ 教学中心测试完成');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 运行测试
const role = process.argv[2] || 'teacher';
console.log(`\n开始测试 - 角色: ${role}\n`);
testTeachingCenter(role);

