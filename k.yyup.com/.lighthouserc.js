module.exports = {
  ci: {
    // 收集设置
    collect: {
      // 测试URL配置
      url: [
        // 主要页面
        'http://localhost:5173/',
        'http://localhost:5173/login',
        'http://localhost:5173/dashboard',
        'http://localhost:5173/students',
        'http://localhost:5173/teachers', 
        'http://localhost:5173/activities',
        'http://localhost:5173/ai-assistant',
        
        // 移动端测试
        'http://localhost:5173/?mobile=true'
      ],
      
      // 启动服务器命令
      startServerCommand: 'npm run start:ci',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 60000,
      
      // 设备配置
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        
        // 自定义审计配置
        onlyAudits: [
          // 性能审计
          'first-contentful-paint',
          'largest-contentful-paint', 
          'first-meaningful-paint',
          'speed-index',
          'total-blocking-time',
          'cumulative-layout-shift',
          'interactive',
          
          // 可访问性审计
          'color-contrast',
          'heading-order',
          'html-has-lang',
          'image-alt',
          'label',
          'link-name',
          'meta-description',
          
          // 最佳实践审计
          'uses-https',
          'uses-http2',
          'uses-responsive-images',
          'efficient-animated-content',
          'unused-css-rules',
          'unused-javascript',
          
          // SEO审计
          'document-title',
          'meta-description',
          'hreflang',
          'canonical',
          'robots-txt'
        ]
      },
      
      // 并发数
      numberOfRuns: 3,
    },
    
    // 断言配置 - 性能预期
    assert: {
      assertions: {
        // 性能指标阈值
        'categories:performance': ['error', { minScore: 0.8 }],  // 性能分数 ≥ 80
        'categories:accessibility': ['error', { minScore: 0.9 }], // 可访问性 ≥ 90
        'categories:best-practices': ['error', { minScore: 0.85 }], // 最佳实践 ≥ 85
        'categories:seo': ['error', { minScore: 0.8 }],           // SEO ≥ 80
        'categories:pwa': ['warn', { minScore: 0.6 }],            // PWA ≥ 60 (警告)
        
        // 核心Web指标
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],      // FCP < 2s
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],    // LCP < 4s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],      // CLS < 0.1
        'total-blocking-time': ['error', { maxNumericValue: 500 }],          // TBT < 500ms
        'interactive': ['error', { maxNumericValue: 5000 }],                 // TTI < 5s
        'speed-index': ['error', { maxNumericValue: 4000 }],                 // SI < 4s
        
        // 资源优化
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }],           // 未使用CSS < 50KB
        'unused-javascript': ['warn', { maxNumericValue: 100000 }],         // 未使用JS < 100KB
        'uses-responsive-images': ['warn', { minScore: 0.8 }],              // 响应式图片 ≥ 80%
        'efficient-animated-content': ['warn', { minScore: 0.8 }],          // 高效动画 ≥ 80%
        
        // 可访问性
        'color-contrast': ['error', { minScore: 1 }],                       // 颜色对比度 100%
        'heading-order': ['error', { minScore: 1 }],                        // 标题顺序 100%
        'html-has-lang': ['error', { minScore: 1 }],                        // HTML语言 100%
        'image-alt': ['error', { minScore: 1 }],                            // 图片alt 100%
        
        // 安全性
        'uses-https': ['error', { minScore: 1 }],                           // HTTPS 100%
        
        // SEO基础
        'document-title': ['error', { minScore: 1 }],                       // 页面标题 100%
        'meta-description': ['warn', { minScore: 1 }],                      // Meta描述 100%
      },
      
      // 矩阵断言 - 针对不同页面的特殊要求
      matrix: [
        {
          matchingUrlPattern: '.*dashboard.*',
          assertions: {
            // 仪表板页面更高的性能要求
            'categories:performance': ['error', { minScore: 0.85 }],
            'largest-contentful-paint': ['error', { maxNumericValue: 3500 }],
            'total-blocking-time': ['error', { maxNumericValue: 400 }],
          }
        },
        {
          matchingUrlPattern: '.*login.*',
          assertions: {
            // 登录页面最高的性能要求
            'categories:performance': ['error', { minScore: 0.9 }],
            'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
            'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
          }
        },
        {
          matchingUrlPattern: '.*mobile=true.*',
          assertions: {
            // 移动端性能要求
            'categories:performance': ['error', { minScore: 0.75 }],
            'first-contentful-paint': ['error', { maxNumericValue: 2500 }],
            'largest-contentful-paint': ['error', { maxNumericValue: 4500 }],
          }
        }
      ]
    },
    
    // 上传配置
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-results',
      reportFilenamePattern: 'lighthouse-%%DATETIME%%-%%PATHNAME%%-report.%%EXTENSION%%'
    },
    
    // 服务器配置 (可选 - 用于Lighthouse CI服务器)
    server: {
      // 如果使用LHCI服务器，在这里配置
    },
    
    // GitHub集成配置
    wizard: {
      // GitHub App配置会在CI环境中自动处理
    }
  },
  
  // 自定义配置用于不同环境
  environments: {
    development: {
      ci: {
        collect: {
          url: [
            'http://localhost:5173/',
            'http://localhost:5173/dashboard'
          ]
        },
        assert: {
          assertions: {
            // 开发环境较宽松的要求
            'categories:performance': ['warn', { minScore: 0.7 }],
          }
        }
      }
    },
    
    staging: {
      ci: {
        collect: {
          url: [
            'https://staging.k.yyup.com/',
            'https://staging.k.yyup.com/dashboard',
            'https://staging.k.yyup.com/students'
          ]
        }
      }
    },
    
    production: {
      ci: {
        collect: {
          url: [
            'https://k.yyup.com/',
            'https://k.yyup.com/dashboard',
            'https://k.yyup.com/students',
            'https://k.yyup.com/teachers',
            'https://k.yyup.com/activities'
          ]
        },
        assert: {
          assertions: {
            // 生产环境最严格的要求
            'categories:performance': ['error', { minScore: 0.85 }],
            'categories:accessibility': ['error', { minScore: 0.95 }],
            'categories:best-practices': ['error', { minScore: 0.9 }],
            'categories:seo': ['error', { minScore: 0.85 }],
          }
        }
      }
    }
  }
};