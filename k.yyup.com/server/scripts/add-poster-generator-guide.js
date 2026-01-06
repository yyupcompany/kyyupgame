// 通过API添加海报生成器页面说明文档
const axios = require('axios');

async function addPosterGeneratorGuide() {
  try {
    console.log('🚀 通过API添加海报生成器页面说明文档...');
    
    // 后端服务器地址
    const baseURL = 'http://localhost:3000/api';
    
    // 页面说明文档数据
    const pageGuideData = {
      pagePath: '/principal/poster-generator/1',
      pageName: '海报生成器',
      pageDescription: '智能海报生成器是专为幼儿园设计的营销工具，帮助您快速创建专业的招生海报、活动宣传海报等。通过选择模板、编辑内容、预览生成三个简单步骤，即可制作出精美的宣传海报，提升幼儿园的品牌形象和招生效果。',
      category: '营销工具',
      importance: 8,
      relatedTables: ['poster_templates', 'poster_generations', 'media_assets'],
      contextPrompt: '用户正在使用海报生成器页面，这是一个智能营销工具。用户可能需要选择模板、编辑海报内容、调整样式设置、预览和生成海报等。请根据用户的具体需求，提供海报制作相关的专业建议和操作指导。',
      isActive: true
    };

    // 页面功能板块数据
    const sectionsData = [
      {
        sectionName: '模板选择',
        sectionDescription: '从丰富的模板库中选择适合的海报模板',
        sectionPath: '/principal/poster-generator',
        features: [
          '多种模板分类（招生、活动、节日等）',
          '模板预览和筛选',
          '模板收藏和推荐',
          '自定义模板上传'
        ],
        sortOrder: 1,
        isActive: true
      },
      {
        sectionName: '内容编辑',
        sectionDescription: '编辑海报的文字内容和基本信息',
        features: [
          '海报标题编辑',
          '副标题设置',
          '主要内容描述',
          '联系方式添加',
          '实时预览效果'
        ],
        sortOrder: 2,
        isActive: true
      },
      {
        sectionName: '图片设置',
        sectionDescription: '上传和管理海报中的图片素材',
        features: [
          '背景图片上传',
          'Logo图片添加',
          '装饰图片插入',
          '图片裁剪和调整',
          '图片库管理'
        ],
        sortOrder: 3,
        isActive: true
      },
      {
        sectionName: '样式设置',
        sectionDescription: '调整海报的颜色、字体和布局样式',
        features: [
          '主题色彩选择',
          '字体样式设置',
          '布局调整',
          '元素位置调整',
          '特效和滤镜'
        ],
        sortOrder: 4,
        isActive: true
      },
      {
        sectionName: '预览生成',
        sectionDescription: '预览海报效果并生成最终作品',
        features: [
          '高清预览',
          '多尺寸生成',
          '格式选择（PNG/JPG）',
          '质量设置',
          '批量生成',
          '下载和分享'
        ],
        sortOrder: 5,
        isActive: true
      }
    ];

    // 创建页面说明文档
    console.log('📝 创建页面说明文档...');
    const response = await axios.post(`${baseURL}/page-guides`, pageGuideData);
    
    if (response.data.success) {
      console.log('✅ 页面说明文档创建成功:', response.data.data.id);
      
      const pageGuideId = response.data.data.id;
      
      // 创建功能板块
      console.log('📋 创建功能板块...');
      for (const sectionData of sectionsData) {
        const sectionResponse = await axios.post(`${baseURL}/page-guide-sections`, {
          ...sectionData,
          pageGuideId
        });
        
        if (sectionResponse.data.success) {
          console.log(`✅ 功能板块创建成功: ${sectionData.sectionName}`);
        } else {
          console.error(`❌ 功能板块创建失败: ${sectionData.sectionName}`, sectionResponse.data.message);
        }
      }
      
      console.log('🎉 海报生成器页面说明文档添加完成！');
    } else {
      console.error('❌ 页面说明文档创建失败:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ 添加页面说明文档失败:', error.message);
    if (error.response) {
      console.error('响应错误:', error.response.data);
    }
  }
}

// 执行添加操作
addPosterGeneratorGuide();
