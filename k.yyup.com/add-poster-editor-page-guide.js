import axios from 'axios';

// 海报编辑器页面说明文档数据
const posterEditorPageGuide = {
  pagePath: '/principal/poster-editor',
  pageName: '海报编辑器',
  pageDescription: '欢迎使用AI智能海报编辑器！这是一个专为幼儿园活动设计的智能海报创作平台。您可以通过自然语言描述您想要的海报风格和内容，AI助手将为您生成专业的活动海报。支持多种风格选择、快捷操作模板，让海报设计变得简单高效，助力您的幼儿园活动宣传。',
  category: 'AI工具',
  importance: 8,
  relatedTables: ['activities', 'posters', 'ai_generations', 'poster_templates'],
  contextPrompt: '用户正在使用AI海报编辑器，这是一个智能海报设计工具。用户可能需要设计活动海报、调整海报风格、生成海报内容、导出海报等。请提供专业的海报设计建议和AI使用指导。',
  isActive: true
};

// 海报编辑器功能板块数据
const posterEditorSections = [
  {
    sectionName: '海报预览区',
    sectionDescription: '实时预览生成的海报效果，支持查看、重新生成和重置操作',
    sectionPath: '/principal/poster-editor#preview',
    features: ['实时预览', '海报展示', '重新生成', '重置操作', '效果查看'],
    sortOrder: 1,
    isActive: true
  },
  {
    sectionName: 'AI设计助手',
    sectionDescription: '智能对话界面，通过自然语言与AI交流，描述您的海报需求',
    sectionPath: '/principal/poster-editor#ai-chat',
    features: ['智能对话', '需求理解', '风格建议', '内容优化', '实时交互'],
    sortOrder: 2,
    isActive: true
  },
  {
    sectionName: '快速操作',
    sectionDescription: '预设的海报风格快捷按钮，一键生成常用风格的海报提示词',
    sectionPath: '/principal/poster-editor#quick-actions',
    features: ['温馨可爱', '色彩鲜艳', '简约清新', '添加装饰', '调整颜色', '修改排版'],
    sortOrder: 3,
    isActive: true
  },
  {
    sectionName: '风格设置',
    sectionDescription: '详细的海报风格配置选项，包括风格、镜头、色调、构图等设置',
    sectionPath: '/principal/poster-editor#style-settings',
    features: ['风格选择', '镜头设置', '色调配置', '构图布局', '参数调整'],
    sortOrder: 4,
    isActive: true
  },
  {
    sectionName: '操作工具栏',
    sectionDescription: '海报编辑的核心操作区域，包括保存、导出、返回等功能',
    sectionPath: '/principal/poster-editor#toolbar',
    features: ['保存海报', '导出功能', '返回导航', '操作历史', '快捷键支持'],
    sortOrder: 5,
    isActive: true
  }
];

// API配置
const API_BASE_URL = 'http://localhost:3000/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzU1MDY0NzIsImV4cCI6MTczNTU5Mjg3Mn0.Qs8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // 请替换为实际的token

async function addPosterEditorPageGuide() {
  try {
    console.log('🚀 开始添加海报编辑器页面说明文档...');

    // 创建页面说明文档
    const pageGuideResponse = await axios.post(
      `${API_BASE_URL}/page-guides`,
      posterEditorPageGuide,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (pageGuideResponse.data.success) {
      const pageGuideId = pageGuideResponse.data.data.id;
      console.log('✅ 页面说明文档创建成功，ID:', pageGuideId);

      // 创建功能板块
      console.log('📝 开始添加功能板块...');
      
      for (const section of posterEditorSections) {
        const sectionData = {
          ...section,
          pageGuideId: pageGuideId
        };

        const sectionResponse = await axios.post(
          `${API_BASE_URL}/page-guides/${pageGuideId}/sections`,
          sectionData,
          {
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (sectionResponse.data.success) {
          console.log(`✅ 功能板块 "${section.sectionName}" 创建成功`);
        } else {
          console.error(`❌ 功能板块 "${section.sectionName}" 创建失败:`, sectionResponse.data.message);
        }
      }

      console.log('🎉 海报编辑器页面说明文档添加完成！');
      
      // 验证创建结果
      console.log('🔍 验证创建结果...');
      const verifyResponse = await axios.get(
        `${API_BASE_URL}/page-guides/by-path/${encodeURIComponent('/principal/poster-editor')}`,
        {
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`
          }
        }
      );

      if (verifyResponse.data.success) {
        const pageGuide = verifyResponse.data.data;
        console.log('✅ 验证成功！页面说明文档详情:');
        console.log(`   页面名称: ${pageGuide.pageName}`);
        console.log(`   页面描述: ${pageGuide.pageDescription.substring(0, 100)}...`);
        console.log(`   功能板块数量: ${pageGuide.sections?.length || 0}`);
        
        if (pageGuide.sections && pageGuide.sections.length > 0) {
          console.log('   功能板块列表:');
          pageGuide.sections.forEach((section, index) => {
            console.log(`     ${index + 1}. ${section.sectionName}`);
          });
        }
      } else {
        console.error('❌ 验证失败:', verifyResponse.data.message);
      }

    } else {
      console.error('❌ 页面说明文档创建失败:', pageGuideResponse.data.message);
    }

  } catch (error) {
    console.error('❌ 添加页面说明文档时发生错误:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
  }
}

// 执行添加操作
addPosterEditorPageGuide();
