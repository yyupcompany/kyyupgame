/**
 * 测试基本资料API
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3000';

async function testBasicInfoAPI() {
  try {
    console.log('🧪 测试基本资料API...\n');

    // 1. 登录获取token
    console.log('1️⃣ 登录园长账号...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: 'principal',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ 登录失败:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功，获取到token\n');

    // 2. 检查基本资料API端点
    console.log('2️⃣ 检查基本资料API端点...');
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // 测试获取基本资料
    try {
      const getResponse = await axios.get(`${API_BASE_URL}/api/kindergarten/basic-info`, {
        headers
      });
      
      if (getResponse.data.success) {
        console.log('✅ 获取基本资料API正常');
        console.log('   数据:', JSON.stringify(getResponse.data.data, null, 2));
      } else {
        console.log('⚠️  获取基本资料返回失败:', getResponse.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.log('❌ 获取基本资料API错误:', error.response.status, error.response.data);
      } else {
        console.log('❌ 获取基本资料API错误:', error.message);
      }
    }

    console.log('');

    // 3. 测试图片上传API
    console.log('3️⃣ 测试图片上传API...');
    
    // 创建一个测试图片 (1x1 PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const testImagePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(testImagePath, testImageBuffer);
    
    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(testImagePath), {
        filename: 'test-logo.png',
        contentType: 'image/png'
      });

      const uploadResponse = await axios.post(
        `${API_BASE_URL}/api/kindergarten/upload-image`,
        formData,
        {
          headers: {
            ...headers,
            ...formData.getHeaders()
          }
        }
      );

      if (uploadResponse.data.success) {
        console.log('✅ 图片上传API正常');
        console.log('   上传的图片URL:', uploadResponse.data.data.url);
      } else {
        console.log('⚠️  图片上传返回失败:', uploadResponse.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.log('❌ 图片上传API错误:', error.response.status, error.response.data);
      } else {
        console.log('❌ 图片上传API错误:', error.message);
      }
    } finally {
      // 清理测试文件
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    }

    console.log('');

    // 4. 测试保存基本资料
    console.log('4️⃣ 测试保存基本资料API...');
    
    const testData = {
      name: '测试幼儿园',
      description: '这是一个测试幼儿园的介绍',
      studentCount: 100,
      teacherCount: 20,
      classCount: 5,
      contactPerson: '张老师',
      consultationPhone: '13800138000',
      address: '测试地址123号'
    };

    try {
      const saveResponse = await axios.put(
        `${API_BASE_URL}/api/kindergarten/basic-info`,
        testData,
        { headers }
      );

      if (saveResponse.data.success) {
        console.log('✅ 保存基本资料API正常');
      } else {
        console.log('⚠️  保存基本资料返回失败:', saveResponse.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.log('❌ 保存基本资料API错误:', error.response.status, error.response.data);
      } else {
        console.log('❌ 保存基本资料API错误:', error.message);
      }
    }

    console.log('\n✅ API测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testBasicInfoAPI();

