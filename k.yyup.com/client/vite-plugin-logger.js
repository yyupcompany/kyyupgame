export function createLogger() {
  return {
    name: 'vite-access-logger',
    configureServer(server) {
      // 在所有中间件之前添加日志中间件
      server.middlewares.use((req, res, next) => {
        const start = Date.now()
        const timestamp = new Date().toLocaleTimeString()
        
        // 保存原始的 end 方法
        const originalEnd = res.end
        
        res.end = function(...args) {
          const duration = Date.now() - start
          const method = req.method || 'GET'
          const url = req.url || ''
          const status = res.statusCode || 200
          
          // 过滤掉一些不重要的请求
          const shouldLog = !url.includes('/@vite') && 
                          !url.includes('/__vite') && 
                          !url.includes('/node_modules/') &&
                          !url.endsWith('.map')
          
          if (shouldLog) {
            // 根据状态码设置颜色
            let statusStr = status.toString()
            if (status >= 200 && status < 300) {
              statusStr = `\x1b[32m${status}\x1b[0m` // 绿色
            } else if (status >= 300 && status < 400) {
              statusStr = `\x1b[33m${status}\x1b[0m` // 黄色
            } else if (status >= 400) {
              statusStr = `\x1b[31m${status}\x1b[0m` // 红色
            }
            
            console.log(`[${timestamp}] ${method.padEnd(6)} ${statusStr} ${url} - ${duration}ms`)
          }
          
          // 调用原始方法
          originalEnd.apply(res, args)
        }
        
        next()
      })
    }
  }
}