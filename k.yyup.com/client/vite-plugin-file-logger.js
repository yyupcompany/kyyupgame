import fs from 'fs'
import path from 'path'

export function createFileLogger() {
  const logDir = path.join(process.cwd(), 'logs')
  const logFile = path.join(logDir, 'access.log')
  
  // 确保日志目录存在
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  
  // 写入日志的函数
  function writeLog(message) {
    const timestamp = new Date().toISOString()
    const logEntry = `${timestamp} ${message}\n`
    
    // 同时输出到控制台和文件
    console.log(message)
    fs.appendFileSync(logFile, logEntry)
  }
  
  return {
    name: 'vite-file-logger',
    configureServer(server) {
      // 服务器启动时记录
      writeLog('=== Vite Dev Server Started ===')
      
      server.middlewares.use((req, res, next) => {
        const start = Date.now()
        const method = req.method || 'GET'
        const url = req.url || ''
        
        // 保存原始的 end 方法
        const originalEnd = res.end
        
        res.end = function(...args) {
          const duration = Date.now() - start
          const status = res.statusCode || 200
          
          // 过滤掉一些不重要的请求
          const shouldLog = !url.includes('/@vite') && 
                          !url.includes('/__vite') && 
                          !url.includes('/node_modules/') &&
                          !url.endsWith('.map') &&
                          !url.includes('/@fs/')
          
          if (shouldLog) {
            const message = `${method.padEnd(6)} ${status} ${url} - ${duration}ms`
            writeLog(message)
          }
          
          // 调用原始方法
          originalEnd.apply(res, args)
        }
        
        next()
      })
    }
  }
}