const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock_dev_token_test'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAlbumAPI() {
  console.log('测试相册中心相关API...\n');

  try {
    // 1. 测试相册统计API
    console.log('1. 测试相册统计API: /api/albums/statistics');
    try {
      const albumStats = await makeRequest('/api/albums/statistics');
      console.log(`   状态码: ${albumStats.status}`);
      console.log(`   响应:`, JSON.stringify(albumStats.body, null, 4));
    } catch (error) {
      console.log('   错误:', error.message);
    }

    console.log('\n2. 测试媒体中心统计API: /api/media-center/statistics');
    try {
      const mediaStats = await makeRequest('/api/media-center/statistics');
      console.log(`   状态码: ${mediaStats.status}`);
      console.log(`   响应:`, JSON.stringify(mediaStats.body, null, 4));
    } catch (error) {
      console.log('   错误:', error.message);
    }

    console.log('\n3. 测试相册列表API: /api/albums');
    try {
      const albumList = await makeRequest('/api/albums');
      console.log(`   状态码: ${albumList.status}`);
      console.log(`   响应:`, JSON.stringify(albumList.body, null, 4));
    } catch (error) {
      console.log('   错误:', error.message);
    }

    console.log('\n4. 测试照片列表API: /api/photos');
    try {
      const photoList = await makeRequest('/api/photos');
      console.log(`   状态码: ${photoList.status}`);
      console.log(`   响应:`, JSON.stringify(photoList.body, null, 4));
    } catch (error) {
      console.log('   错误:', error.message);
    }

  } catch (error) {
    console.error('测试失败:', error);
  }
}

testAlbumAPI();