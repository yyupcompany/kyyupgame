const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class ServerManager {
  constructor() {
    this.app = express();
    this.server = null;
    this.port = 0;
    this.dbManager = null;

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: false // 允许本地资源
    }));

    // CORS配置
    this.app.use(cors({
      origin: ['http://localhost:5174', 'file://'],
      credentials: true
    }));

    // 解析JSON和URL编码的数据
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 静态文件服务
    this.app.use('/uploads', express.static(path.join(__dirname, '../../data/uploads')));

    // 请求日志
    this.app.use((req, res, next) => {
      console.log(`📡 ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // 健康检查
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        port: this.port
      });
    });

    // 认证路由
    this.setupAuthRoutes();

    // 用户管理路由
    this.setupUserRoutes();

    // 学生管理路由
    this.setupStudentRoutes();

    // 班级管理路由
    this.setupClassRoutes();

    // 活动管理路由
    this.setupActivityRoutes();

    // 考勤管理路由
    this.setupAttendanceRoutes();

    // 系统管理路由
    this.setupSystemRoutes();

    // 文件上传路由
    this.setupFileRoutes();

    // 数据库操作路由
    this.setupDatabaseRoutes();

    // 404处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: '接口不存在',
        path: req.originalUrl
      });
    });

    // 错误处理中间件
    this.app.use((error, req, res, next) => {
      console.error('❌ 服务器错误:', error);

      res.status(error.status || 500).json({
        success: false,
        message: error.message || '服务器内部错误',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });
  }

  setupAuthRoutes() {
    // 登录
    this.app.post('/api/auth/login', async (req, res) => {
      try {
        const { username, password } = req.body;

        if (!username || !password) {
          return res.status(400).json({
            success: false,
            message: '用户名和密码不能为空'
          });
        }

        // 这里应该连接数据库验证用户
        // 暂时使用硬编码的管理员账户
        if (username === 'admin' && password === '123456') {
          const token = jwt.sign(
            { id: 1, username: 'admin', role: 'admin' },
            'your-secret-key',
            { expiresIn: '24h' }
          );

          res.json({
            success: true,
            data: {
              token,
              user: {
                id: 1,
                username: 'admin',
                fullName: '系统管理员',
                role: 'admin',
                avatar: null
              }
            }
          });
        } else {
          res.status(401).json({
            success: false,
            message: '用户名或密码错误'
          });
        }

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '登录失败'
        });
      }
    });

    // 获取用户信息
    this.app.get('/api/auth/me', async (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return res.status(401).json({
            success: false,
            message: '未提供认证令牌'
          });
        }

        const decoded = jwt.verify(token, 'your-secret-key');

        res.json({
          success: true,
          data: {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
            fullName: '系统管理员'
          }
        });

      } catch (error) {
        res.status(401).json({
          success: false,
          message: '无效的认证令牌'
        });
      }
    });

    // 登出
    this.app.post('/api/auth/logout', (req, res) => {
      res.json({
        success: true,
        message: '登出成功'
      });
    });
  }

  setupUserRoutes() {
    // 获取用户列表
    this.app.get('/api/users', async (req, res) => {
      try {
        const { page = 1, limit = 20, search = '', role = '' } = req.query;

        // 模拟数据
        const users = [
          {
            id: 1,
            username: 'admin',
            email: 'admin@kindergarten.com',
            fullName: '系统管理员',
            role: 'admin',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z'
          }
        ];

        res.json({
          success: true,
          data: {
            users,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: users.length,
              totalPages: 1
            }
          }
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '获取用户列表失败'
        });
      }
    });

    // 创建用户
    this.app.post('/api/users', async (req, res) => {
      try {
        const userData = req.body;

        // 这里应该保存到数据库
        // 暂时返回成功响应

        res.status(201).json({
          success: true,
          data: {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString()
          }
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '创建用户失败'
        });
      }
    });
  }

  setupStudentRoutes() {
    // 获取学生列表
    this.app.get('/api/students', async (req, res) => {
      try {
        const { page = 1, limit = 20, search = '', classId = '' } = req.query;

        // 模拟数据
        const students = [];

        res.json({
          success: true,
          data: {
            students,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: 0,
              totalPages: 0
            }
          }
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '获取学生列表失败'
        });
      }
    });

    // 创建学生
    this.app.post('/api/students', async (req, res) => {
      try {
        const studentData = req.body;

        res.status(201).json({
          success: true,
          data: {
            id: Date.now(),
            ...studentData,
            createdAt: new Date().toISOString()
          }
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '创建学生失败'
        });
      }
    });
  }

  setupClassRoutes() {
    // 获取班级列表
    this.app.get('/api/classes', async (req, res) => {
      try {
        const classes = [];

        res.json({
          success: true,
          data: classes
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '获取班级列表失败'
        });
      }
    });

    // 创建班级
    this.app.post('/api/classes', async (req, res) => {
      try {
        const classData = req.body;

        res.status(201).json({
          success: true,
          data: {
            id: Date.now(),
            ...classData,
            createdAt: new Date().toISOString()
          }
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '创建班级失败'
        });
      }
    });
  }

  setupActivityRoutes() {
    // 获取活动列表
    this.app.get('/api/activities', async (req, res) => {
      try {
        const activities = [];

        res.json({
          success: true,
          data: {
            activities,
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0
            }
          }
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '获取活动列表失败'
        });
      }
    });
  }

  setupAttendanceRoutes() {
    // 获取考勤记录
    this.app.get('/api/attendance', async (req, res) => {
      try {
        const { date, classId } = req.query;
        const attendance = [];

        res.json({
          success: true,
          data: attendance
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '获取考勤记录失败'
        });
      }
    });
  }

  setupSystemRoutes() {
    // 获取系统信息
    this.app.get('/api/system/info', async (req, res) => {
      try {
        res.json({
          success: true,
          data: {
            version: '1.0.0',
            environment: 'production',
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime()
          }
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '获取系统信息失败'
        });
      }
    });

    // 系统设置
    this.app.get('/api/system/settings', async (req, res) => {
      try {
        const settings = {
          appName: '幼儿园管理系统',
          pageSize: 20,
          theme: 'light'
        };

        res.json({
          success: true,
          data: settings
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '获取系统设置失败'
        });
      }
    });
  }

  setupFileRoutes() {
    // 文件上传配置
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../data/uploads');
        if (!require('fs').existsSync(uploadDir)) {
          require('fs').mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    const upload = multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 } // 10MB
    });

    // 文件上传
    this.app.post('/api/upload', upload.single('file'), (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: '未选择文件'
          });
        }

        res.json({
          success: true,
          data: {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`
          }
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '文件上传失败'
        });
      }
    });
  }

  setupDatabaseRoutes() {
    // 数据库统计
    this.app.get('/api/database/stats', async (req, res) => {
      try {
        // 这里应该从数据库管理器获取实际数据
        const stats = {
          users: 1,
          students: 0,
          classes: 0,
          activities: 0,
          attendance: 0,
          logs: 0
        };

        res.json({
          success: true,
          data: stats
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '获取数据库统计失败'
        });
      }
    });

    // 数据库备份
    this.app.post('/api/database/backup', async (req, res) => {
      try {
        // 这里应该调用数据库管理器的备份方法
        res.json({
          success: true,
          message: '数据库备份完成',
          data: {
            backupPath: `/backups/kindergarten-${Date.now()}.db`
          }
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: '数据库备份失败'
        });
      }
    });
  }

  async start() {
    return new Promise((resolve, reject) => {
      // 查找可用端口
      this.server = this.app.listen(0, 'localhost', (err) => {
        if (err) {
          reject(err);
        } else {
          this.port = this.server.address().port;
          console.log(`🚀 内置服务器启动在端口 ${this.port}`);
          resolve();
        }
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 内置服务器已停止');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  setDatabaseManager(dbManager) {
    this.dbManager = dbManager;
  }
}

module.exports = { ServerManager };