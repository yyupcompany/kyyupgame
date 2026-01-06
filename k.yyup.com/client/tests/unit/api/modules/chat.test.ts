import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, vi, beforeEach } from 'vitest';
import * as chatApi from '@/api/modules/chat';
import { get, post, put, del } from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';

// Mock the request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}));

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(post);
const mockedPut = vi.mocked(put);
const mockedDel = vi.mocked(del);

describe('Chat API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should get conversations with all parameters', async () => {
      const mockParams = {
        page: 1,
        pageSize: 20,
        keyword: 'test',
        type: 'private',
        participantId: 'user-123'
      };
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 'conv-123',
              title: 'Test Conversation',
              participants: [
                {
                  id: 'user-123',
                  name: 'John Doe',
                  avatar: 'https://example.com/avatar.jpg',
                  role: 'admin'
                },
                {
                  id: 'user-456',
                  name: 'Jane Smith',
                  avatar: 'https://example.com/avatar2.jpg',
                  role: 'user'
                }
              ],
              lastMessage: {
                id: 'msg-123',
                conversationId: 'conv-123',
                senderId: 'user-123',
                senderName: 'John Doe',
                type: 'text',
                content: 'Hello there!',
                status: 'delivered',
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-01T10:00:00Z'
              },
              unreadCount: 2,
              isGroup: false,
              createdAt: '2024-01-01T09:00:00Z',
              updatedAt: '2024-01-01T10:00:00Z'
            }
          ],
          total: 1
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.getConversations(mockParams);

      expect(mockedGet).toHaveBeenCalledWith('/chat/conversations', { params: mockParams });
      expect(result).toEqual(mockResponse);

      // ✅ 控制台错误检查
      expectNoConsoleErrors();
    });

    it('should get conversations without parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.getConversations();

      expect(mockedGet).toHaveBeenCalledWith('/chat/conversations', { params: undefined });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createConversation', () => {
    it('should create private conversation', async () => {
      const mockData: chatApi.CreateConversationRequest = {
        title: 'Private Chat',
        participantIds: ['user-456'],
        isGroup: false
      };
      const mockResponse = {
        success: true,
        data: {
          id: 'conv-123',
          title: 'Private Chat',
          participants: [
            {
              id: 'user-123',
              name: 'John Doe',
              avatar: 'https://example.com/avatar.jpg',
              role: 'admin'
            },
            {
              id: 'user-456',
              name: 'Jane Smith',
              avatar: 'https://example.com/avatar2.jpg',
              role: 'user'
            }
          ],
          unreadCount: 0,
          isGroup: false,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.createConversation(mockData);

      expect(mockedPost).toHaveBeenCalledWith('/chat/conversations', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should create group conversation', async () => {
      const mockData: chatApi.CreateConversationRequest = {
        title: 'Team Discussion',
        participantIds: ['user-456', 'user-789', 'user-101'],
        isGroup: true
      };
      const mockResponse = {
        success: true,
        data: {
          id: 'conv-456',
          title: 'Team Discussion',
          participants: [
            {
              id: 'user-123',
              name: 'John Doe',
              avatar: 'https://example.com/avatar.jpg',
              role: 'admin'
            },
            {
              id: 'user-456',
              name: 'Jane Smith',
              avatar: 'https://example.com/avatar2.jpg',
              role: 'user'
            }
          ],
          unreadCount: 0,
          isGroup: true,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.createConversation(mockData);

      expect(mockedPost).toHaveBeenCalledWith('/chat/conversations', mockData);
      expect(result.data.isGroup).toBe(true);
    });
  });

  describe('getConversation', () => {
    it('should get conversation by id', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'conv-123',
          title: 'Test Conversation',
          participants: [
            {
              id: 'user-123',
              name: 'John Doe',
              avatar: 'https://example.com/avatar.jpg',
              role: 'admin'
            }
          ],
          lastMessage: {
            id: 'msg-123',
            conversationId: 'conv-123',
            senderId: 'user-123',
            senderName: 'John Doe',
            type: 'text',
            content: 'Hello there!',
            status: 'delivered',
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          },
          unreadCount: 0,
          isGroup: false,
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.getConversation('conv-123');

      expect(mockedGet).toHaveBeenCalledWith('/chat/conversations/conv-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateConversation', () => {
    it('should update conversation title', async () => {
      const mockData = {
        title: 'Updated Conversation Title'
      };
      const mockResponse = {
        success: true,
        data: {
          id: 'conv-123',
          title: 'Updated Conversation Title',
          participants: [],
          unreadCount: 0,
          isGroup: false,
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-01T11:00:00Z'
        }
      };

      mockedPut.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.updateConversation('conv-123', mockData);

      expect(mockedPut).toHaveBeenCalledWith('/chat/conversations/conv-123', mockData);
      expect(result.data.title).toBe('Updated Conversation Title');
    });

    it('should update conversation participants', async () => {
      const mockData = {
        participantIds: ['user-456', 'user-789']
      };
      const mockResponse = {
        success: true,
        data: {
          id: 'conv-123',
          title: 'Test Conversation',
          participants: [
            {
              id: 'user-456',
              name: 'Jane Smith',
              avatar: 'https://example.com/avatar2.jpg',
              role: 'user'
            },
            {
              id: 'user-789',
              name: 'Bob Johnson',
              avatar: 'https://example.com/avatar3.jpg',
              role: 'user'
            }
          ],
          unreadCount: 0,
          isGroup: true,
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-01T11:00:00Z'
        }
      };

      mockedPut.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.updateConversation('conv-123', mockData);

      expect(mockedPut).toHaveBeenCalledWith('/chat/conversations/conv-123', mockData);
      expect(result.data.participants).toHaveLength(2);
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation', async () => {
      const mockResponse = {
        success: true,
        data: null
      };

      mockedDel.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.deleteConversation('conv-123');

      expect(mockedDel).toHaveBeenCalledWith('/chat/conversations/conv-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMessages', () => {
    it('should get messages with pagination', async () => {
      const mockParams = {
        page: 1,
        pageSize: 50,
        beforeMessageId: 'msg-999'
      };
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 'msg-123',
              conversationId: 'conv-123',
              senderId: 'user-123',
              senderName: 'John Doe',
              senderAvatar: 'https://example.com/avatar.jpg',
              type: 'text',
              content: 'Hello there!',
              status: 'read',
              metadata: {},
              createdAt: '2024-01-01T10:00:00Z',
              updatedAt: '2024-01-01T10:00:00Z'
            },
            {
              id: 'msg-124',
              conversationId: 'conv-123',
              senderId: 'user-456',
              senderName: 'Jane Smith',
              senderAvatar: 'https://example.com/avatar2.jpg',
              type: 'text',
              content: 'Hi John!',
              status: 'delivered',
              metadata: {},
              createdAt: '2024-01-01T10:01:00Z',
              updatedAt: '2024-01-01T10:01:00Z'
            }
          ],
          total: 2,
          hasMore: false
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.getMessages('conv-123', mockParams);

      expect(mockedGet).toHaveBeenCalledWith('/chat/conversations/conv-123/messages', { params: mockParams });
      expect(result).toEqual(mockResponse);
    });

    it('should get messages without parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          hasMore: false
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.getMessages('conv-123');

      expect(mockedGet).toHaveBeenCalledWith('/chat/conversations/conv-123/messages', { params: undefined });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendMessage', () => {
    it('should send text message', async () => {
      const mockData: chatApi.SendMessageRequest = {
        conversationId: 'conv-123',
        type: 'text',
        content: 'Hello, this is a test message!',
        metadata: {}
      };
      const mockResponse = {
        success: true,
        data: {
          id: 'msg-125',
          conversationId: 'conv-123',
          senderId: 'user-123',
          senderName: 'John Doe',
          type: 'text',
          content: 'Hello, this is a test message!',
          status: 'sent',
          metadata: {},
          createdAt: '2024-01-01T10:02:00Z',
          updatedAt: '2024-01-01T10:02:00Z'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.sendMessage(mockData);

      expect(mockedPost).toHaveBeenCalledWith('/chat/messages', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should send image message', async () => {
      const mockData: chatApi.SendMessageRequest = {
        conversationId: 'conv-123',
        type: 'image',
        content: 'https://example.com/image.jpg',
        metadata: {
          width: 800,
          height: 600,
          alt: 'Test image'
        }
      };
      const mockResponse = {
        success: true,
        data: {
          id: 'msg-126',
          conversationId: 'conv-123',
          senderId: 'user-123',
          senderName: 'John Doe',
          type: 'image',
          content: 'https://example.com/image.jpg',
          status: 'sent',
          metadata: {
            width: 800,
            height: 600,
            alt: 'Test image'
          },
          createdAt: '2024-01-01T10:03:00Z',
          updatedAt: '2024-01-01T10:03:00Z'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.sendMessage(mockData);

      expect(mockedPost).toHaveBeenCalledWith('/chat/messages', mockData);
      expect(result.data.type).toBe('image');
    });

    it('should send file message', async () => {
      const mockData: chatApi.SendMessageRequest = {
        conversationId: 'conv-123',
        type: 'file',
        content: 'https://example.com/document.pdf',
        metadata: {
          filename: 'document.pdf',
          size: 1024000,
          mimeType: 'application/pdf'
        }
      };
      const mockResponse = {
        success: true,
        data: {
          id: 'msg-127',
          conversationId: 'conv-123',
          senderId: 'user-123',
          senderName: 'John Doe',
          type: 'file',
          content: 'https://example.com/document.pdf',
          status: 'sent',
          metadata: {
            filename: 'document.pdf',
            size: 1024000,
            mimeType: 'application/pdf'
          },
          createdAt: '2024-01-01T10:04:00Z',
          updatedAt: '2024-01-01T10:04:00Z'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.sendMessage(mockData);

      expect(mockedPost).toHaveBeenCalledWith('/chat/messages', mockData);
      expect(result.data.type).toBe('file');
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark message as read', async () => {
      const mockResponse = {
        success: true,
        data: null
      };

      mockedPut.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.markMessageAsRead('msg-123');

      expect(mockedPut).toHaveBeenCalledWith('/chat/messages/msg-123/read');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark conversation as read', async () => {
      const mockResponse = {
        success: true,
        data: null
      };

      mockedPut.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.markConversationAsRead('conv-123');

      expect(mockedPut).toHaveBeenCalledWith('/chat/conversations/conv-123/read');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message', async () => {
      const mockResponse = {
        success: true,
        data: null
      };

      mockedDel.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.deleteMessage('msg-123');

      expect(mockedDel).toHaveBeenCalledWith('/chat/messages/msg-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadFile', () => {
    it('should upload file to conversation', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const conversationId = 'conv-123';
      const mockResponse = {
        success: true,
        data: {
          url: 'https://example.com/files/test.txt',
          filename: 'test.txt',
          size: 12,
          mimeType: 'text/plain'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.uploadFile(mockFile, conversationId);

      // Check that FormData was created correctly
      expect(mockedPost).toHaveBeenCalledWith('/chat/upload', expect.any(FormData));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread message count', async () => {
      const mockResponse = {
        success: true,
        data: {
          total: 5,
          byConversation: {
            'conv-123': 2,
            'conv-456': 3
          }
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.getUnreadCount();

      expect(mockedGet).toHaveBeenCalledWith('/chat/unread-count');
      expect(result).toEqual(mockResponse);
      expect(result.data.total).toBe(5);
      expect(result.data.byConversation['conv-123']).toBe(2);
    });
  });

  describe('Compatibility Exports', () => {
    it('should export compatibility functions', () => {
      expect(chatApi.getChatConversations).toBe(chatApi.chatApi.getConversations);
      expect(chatApi.createChatConversation).toBe(chatApi.chatApi.createConversation);
      expect(chatApi.getChatMessages).toBe(chatApi.chatApi.getMessages);
      expect(chatApi.sendChatMessage).toBe(chatApi.chatApi.sendMessage);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockedGet.mockRejectedValue(mockError);

      await expect(chatApi.chatApi.getConversations())
        .rejects.toThrow('Network error');
    });

    it('should handle API response errors', async () => {
      const mockErrorResponse = {
        success: false,
        data: null,
        message: 'Conversation not found'
      };

      mockedGet.mockResolvedValue(mockErrorResponse);

      const result = await chatApi.chatApi.getConversation('invalid-id');
      expect(result.success).toBe(false);
    });

    it('should handle validation errors', async () => {
      const mockData: chatApi.SendMessageRequest = {
        conversationId: '',
        type: 'text',
        content: ''
      };
      const mockErrorResponse = {
        success: false,
        data: null,
        message: 'Invalid message data'
      };

      mockedPost.mockResolvedValue(mockErrorResponse);

      const result = await chatApi.chatApi.sendMessage(mockData);
      expect(result.success).toBe(false);
    });
  });

  describe('Data Validation', () => {
    it('should validate message type enum values', () => {
      expect(chatApi.MessageType.TEXT).toBe('text');
      expect(chatApi.MessageType.IMAGE).toBe('image');
      expect(chatApi.MessageType.FILE).toBe('file');
      expect(chatApi.MessageType.SYSTEM).toBe('system');
    });

    it('should validate message status enum values', () => {
      expect(chatApi.MessageStatus.SENDING).toBe('sending');
      expect(chatApi.MessageStatus.SENT).toBe('sent');
      expect(chatApi.MessageStatus.DELIVERED).toBe('delivered');
      expect(chatApi.MessageStatus.READ).toBe('read');
      expect(chatApi.MessageStatus.FAILED).toBe('failed');
    });

    it('should handle empty conversation list', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.getConversations();
      expect(result.data.items).toEqual([]);
      expect(result.data.total).toBe(0);
    });

    it('should handle single message in conversation', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 'msg-1',
              conversationId: 'conv-1',
              senderId: 'user-1',
              senderName: 'Test User',
              type: 'text',
              content: 'Single message',
              status: 'read',
              createdAt: '2024-01-01T10:00:00Z',
              updatedAt: '2024-01-01T10:00:00Z'
            }
          ],
          total: 1,
          hasMore: false
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.getMessages('conv-1');
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].content).toBe('Single message');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large message datasets', async () => {
      const largeMessageList = Array.from({ length: 1000 }, (_, index) => ({
        id: `msg-${index + 1}`,
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderName: 'Test User',
        type: 'text',
        content: `Message ${index + 1}`,
        status: 'read',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      }));

      const mockResponse = {
        success: true,
        data: {
          items: largeMessageList,
          total: 1000,
          hasMore: true
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.getMessages('conv-1');
      expect(result.data.items).toHaveLength(1000);
    });

    it('should handle concurrent API calls', async () => {
      const mockResponse = { success: true, data: { items: [], total: 0 } };
      mockedGet.mockResolvedValue(mockResponse);

      const promises = [
        chatApi.chatApi.getConversations(),
        chatApi.chatApi.getMessages('conv-1'),
        chatApi.chatApi.getUnreadCount()
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
    });

    it('should handle special characters in messages', async () => {
      const mockData: chatApi.SendMessageRequest = {
        conversationId: 'conv-1',
        type: 'text',
        content: 'Message with special chars: áéíóú 中文 🎉',
        metadata: {}
      };
      const mockResponse = {
        success: true,
        data: {
          id: 'msg-special',
          conversationId: 'conv-1',
          senderId: 'user-1',
          senderName: 'Test User',
          type: 'text',
          content: 'Message with special chars: áéíóú 中文 🎉',
          status: 'sent',
          metadata: {},
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await chatApi.chatApi.sendMessage(mockData);
      expect(result.data.content).toBe('Message with special chars: áéíóú 中文 🎉');
    });
  });
});