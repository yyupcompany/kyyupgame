/**
 * WebSocket Manager
 * 管理WebSocket连接和消息广播
 */

import { Server as WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { EventEmitter } from 'events';

export class WebSocketManager extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private clients: Set<any> = new Set();

  constructor() {
    super();
  }

  /**
   * 初始化WebSocket服务器
   */
  initialize(server: HttpServer) {
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('WebSocket client connected');
      
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('WebSocket client disconnected');
      });
    });
  }

  /**
   * 广播消息给所有客户端
   */
  broadcast(event: string, data: any) {
    const message = JSON.stringify({ event, data });
    
    this.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    });
  }

  /**
   * 发送消息给特定客户端
   */
  send(client: any, event: string, data: any) {
    if (client.readyState === 1) {
      const message = JSON.stringify({ event, data });
      client.send(message);
    }
  }
}

export const webSocketManager = new WebSocketManager();

