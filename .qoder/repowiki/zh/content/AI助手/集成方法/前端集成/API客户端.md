# API客户端

<cite>
**本文档引用的文件**   
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts)
- [ai-conversation.ts](file://k.yyup.com/client/src/api/modules/ai-conversation.ts)
- [request.ts](file://k.yyup.com/client/src/utils/request.ts)
- [ai-chat-interface-fixed.vue](file://k.yyup.com/ai-chat-interface-fixed.vue)
- [MobileAiAssistant.vue](file://k.yyup.com/client/aimobile/components/MobileAiAssistant.vue)
</cite>

## 目录
1. [引言](#引言)
2. [核心API接口](#核心api接口)
3. [会话管理模块](#会话管理模块)
4. [HTTP请求配置](#http请求配置)
5. [SSE流式数据处理](#sse流式数据处理)
6. [Vue组件中的API使用](#vue组件中的api使用)
7. [错误处理与重试机制](#错误处理与重试机制)
8. [总结](#总结)

## 引言
本文档详细说明了AI助手前端API客户端的实现，重点分析了`ai.ts`中定义的核心API接口和`ai-conversation.ts`中的会话管理模块。文档涵盖了会话创建、消息发送、流式响应处理、请求参数结构、认证头设置、错误码处理和重试机制等关键功能。通过具体的TypeScript接口定义和使用示例，展示了如何在Vue组件中调用这些API，并详细描述了HTTP请求的配置选项和SSE（Server-Sent Events）流式数据的处理策略。

## 核心API接口
`ai.ts`文件定义了AI助手服务的核心API接口，提供了与AI模型和会话交互的完整功能集。这些接口通过`aiApi`对象导出，包含了获取模型列表、创建会话、发送消息等关键方法。

### 会话与消息接口
核心接口定义了会话和消息的数据结构，以及相关的操作方法。

```mermaid
classDiagram
class AIConversation {
+id : number
+title : string
+userId : number
+modelId : number
+createdAt : string
+updatedAt : string
}
class AIMessage {
+id : number
+conversationId : number
+role : 'user' | 'assistant'
+content : string
+metadata? : AIMessageMetadata
+createdAt : string
}
class AIMessageMetadata {
+tokens? : number
+model? : string
+temperature? : number
+responseTime? : number
+attachments? : string[]
+references? : string[]
}
class CreateConversationRequest {
+title? : string
+modelId? : number
}
class SendMessageRequest {
+content : string
+metadata? : AIMessageMetadata
}
AIConversation --> AIMessage : "包含"
AIMessage --> AIMessageMetadata : "包含"
```

**Diagram sources**
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts#L28-L61)

**Section sources**
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts#L128-L557)

### 会话管理API
`aiApi`对象提供了管理AI会话的完整API，包括创建、获取、删除会话等操作。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant Api as "aiApi"
participant Request as "request"
Client->>Api : createConversation(data)
Api->>Request : post(AI_ENDPOINTS.CONVERSATIONS, data)
Request->>Server : HTTP POST /api/ai/conversations
Server-->>Request : 200 OK {id, title, ...}
Request-->>Api : 返回响应
Api-->>Client : 返回会话信息
```

**Diagram sources**
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts#L320-L328)

**Section sources**
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts#L300-L483)

### 流式消息发送
`sendMessageStream`方法实现了SSE流式响应处理，允许客户端实时接收AI助手的响应。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant Stream as "流式API"
participant Server as "服务器"
Client->>Stream : sendMessageStream(conversationId, data, onChunk)
Stream->>Server : POST /api/ai/conversations/{id}/messages + stream=true
Server-->>Stream : 200 OK + text/event-stream
loop 流式数据传输
Server->>Stream : data : {chunk}
Stream->>Client : onChunk(parsed)
end
Server->>Stream : data : [DONE]
Stream-->>Client : 流结束
```

**Diagram sources**
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts#L379-L456)

**Section sources**
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts#L379-L456)

## 会话管理模块
`ai-conversation.ts`文件实现了AI会话管理的核心功能，提供了一个完整的会话管理服务类。

### 会话数据结构
会话管理模块定义了详细的会话和消息数据结构。

```mermaid
classDiagram
class Conversation {
+id : string
+userId : number
+title : string | null
+summary : string | null
+lastMessageAt : string
+messageCount : number
+isArchived : boolean
+createdAt : string
+updatedAt : string
+messages? : Message[]
}
class Message {
+id : number
+conversationId : string
+userId : number
+role : 'user' | 'assistant' | 'system' | 'tool'
+content : string
+messageType : 'text' | 'image' | 'audio' | 'video' | 'file'
+tokens : number
+status : 'sending' | 'delivered' | 'failed'
+createdAt : string
+updatedAt : string
}
class ApiResponse {
+success : boolean
+data? : T
+message? : string
+error? : string
}
Conversation --> Message : "包含"
ApiResponse <|-- AIConversationService : "返回类型"
```

**Diagram sources**
- [ai-conversation.ts](file://k.yyup.com/client/src/api/modules/ai-conversation.ts#L18-L50)

**Section sources**
- [ai-conversation.ts](file://k.yyup.com/client/src/api/modules/ai-conversation.ts#L17-L241)

### 会话管理服务
`AIConversationService`类提供了完整的会话管理功能，包括创建、获取、更新和删除会话。

```mermaid
classDiagram
class AIConversationService {
+getConversations(params?) : Promise<ApiResponse<Conversation[]>>
+createConversation(data?) : Promise<ApiResponse<Conversation>>
+updateConversationTitle(conversationId, data) : Promise<ApiResponse<Conversation>>
+deleteConversation(conversationId) : Promise<ApiResponse<null>>
+getConversationMessages(conversationId, params?) : Promise<ApiResponse<{conversation, messages}>>
+addMessage(conversationId, data) : Promise<ApiResponse<Message>>
+getConversation(conversationId) : Promise<ApiResponse<Conversation>>
+archiveConversation(conversationId) : Promise<ApiResponse<null>>
+unarchiveConversation(conversationId) : Promise<ApiResponse<Conversation>>
+clearConversationMessages(conversationId) : Promise<ApiResponse<null>>
+bulkDeleteConversations(conversationIds) : Promise<ApiResponse<null>>
+getConversationStats(conversationId) : Promise<ApiResponse<{messageCount, tokenCount, lastActivityTime, averageResponseTime}>>
+searchConversations(query, params?) : Promise<ApiResponse<Conversation[]>>
+exportConversation(conversationId, format) : Promise<Blob>
+importConversation(file) : Promise<ApiResponse<Conversation>>
+duplicateConversation(conversationId, newTitle?) : Promise<ApiResponse<Conversation>>
+mergeConversations(sourceConversationIds, targetConversationId?, newTitle?) : Promise<ApiResponse<Conversation>>
}
AIConversationService --> Conversation : "操作"
AIConversationService --> Message : "操作"
AIConversationService --> ApiResponse : "返回"
```

**Diagram sources**
- [ai-conversation.ts](file://k.yyup.com/client/src/api/modules/ai-conversation.ts#L71-L239)

**Section sources**
- [ai-conversation.ts](file://k.yyup.com/client/src/api/modules/ai-conversation.ts#L71-L239)

## HTTP请求配置
`request.ts`文件定义了HTTP请求的全局配置，包括超时设置、拦截器和请求/响应转换。

### 请求实例配置
系统创建了多个axios实例，针对不同类型的请求进行优化配置。

```mermaid
classDiagram
class AxiosInstance {
+baseURL : string
+timeout : number
+withCredentials : boolean
+headers : object
}
class Service {
+baseURL : getApiBaseURL()
+timeout : TimeoutConfigManager.getTimeoutByType('DEFAULT')
+headers : {'Content-Type' : 'application/json; charset=utf-8'}
}
class AiService {
+baseURL : getApiBaseURL()
+timeout : TimeoutConfigManager.getTimeoutByType('AI_ANALYSIS')
+headers : {'Content-Type' : 'application/json; charset=utf-8'}
}
class VideoCreationService {
+baseURL : getApiBaseURL()
+timeout : TimeoutConfigManager.getTimeoutByType('VIDEO_CREATION')
+headers : {'Content-Type' : 'application/json; charset=utf-8'}
}
Service --> AxiosInstance : "继承"
AiService --> AxiosInstance : "继承"
VideoCreationService --> AxiosInstance : "继承"
```

**Diagram sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L88-L116)

**Section sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L88-L116)

### 请求拦截器
请求拦截器负责添加认证头和防止缓存。

```mermaid
flowchart TD
Start([请求开始]) --> CheckToken["检查认证Token"]
CheckToken --> TokenValid{"Token有效?"}
TokenValid --> |是| AddAuth["添加Authorization头"]
TokenValid --> |否| Warn["记录警告"]
AddAuth --> AddTimestamp["添加时间戳防止缓存"]
AddTimestamp --> LogRequest["记录请求日志"]
LogRequest --> End([继续请求])
```

**Diagram sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L118-L146)

**Section sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L118-L146)

### 响应拦截器
响应拦截器处理认证过期和网络错误。

```mermaid
flowchart TD
Start([响应接收]) --> CheckSuccess["检查响应成功"]
CheckSuccess --> Success{"success为true?"}
Success --> |否| Handle401["检查401错误"]
Success --> |是| ReturnData["返回数据"]
Handle401 --> Is401{"状态码为401?"}
Is401 --> |是| RefreshToken["尝试刷新Token"]
Is401 --> |否| CheckNetwork["检查网络错误"]
RefreshToken --> TokenRefreshed{"Token刷新成功?"}
TokenRefreshed --> |是| RetryRequest["重试原请求"]
TokenRefreshed --> |否| RedirectToLogin["跳转到登录页"]
CheckNetwork --> IsNetworkError{"网络错误?"}
IsNetworkError --> |是| SilentHandle["静默处理"]
IsNetworkError --> |否| HandleError["使用ErrorHandler处理"]
ReturnData --> End([返回响应])
RetryRequest --> End
RedirectToLogin --> End
SilentHandle --> End
HandleError --> End
```

**Diagram sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L154-L316)

**Section sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L154-L316)

## SSE流式数据处理
SSE（Server-Sent Events）流式数据处理机制允许客户端实时接收AI助手的响应，提供更好的用户体验。

### 流式数据处理流程
`sendMessageStream`方法实现了完整的SSE流式数据处理流程。

```mermaid
flowchart TD
Start([发送流式消息]) --> BuildUrl["构建请求URL"]
BuildUrl --> SetHeaders["设置请求头"]
SetHeaders --> SendRequest["发送fetch请求"]
SendRequest --> CheckResponse["检查响应状态"]
CheckResponse --> ResponseOk{"响应OK?"}
ResponseOk --> |否| ThrowError["抛出错误"]
ResponseOk --> |是| GetReader["获取响应流读取器"]
GetReader --> CheckReader["检查读取器"]
CheckReader --> ReaderValid{"读取器有效?"}
ReaderValid --> |否| ThrowError
ReaderValid --> |是| InitializeDecoder["初始化文本解码器"]
InitializeDecoder --> ProcessLoop["开始处理循环"]
ProcessLoop --> ReadChunk["读取数据块"]
ReadChunk --> Done{"读取完成?"}
Done --> |是| ReleaseLock["释放锁"]
Done --> |否| DecodeData["解码数据"]
DecodeData --> SplitLines["分割行"]
SplitLines --> ProcessLines["处理每一行"]
ProcessLines --> LineStart{"行以'data: '开头?"}
LineStart --> |否| ContinueLoop["继续循环"]
LineStart --> |是| ExtractData["提取数据"]
ExtractData --> DataDone{"数据为'[DONE]'?"}
DataDone --> |是| Return["返回"]
DataDone --> |否| ParseJson["解析JSON"]
ParseJson --> OnChunk["调用onChunk回调"]
OnChunk --> ContinueLoop
ContinueLoop --> ProcessLoop
ReleaseLock --> End([流结束])
```

**Diagram sources**
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts#L379-L456)

**Section sources**
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts#L379-L456)

### 连接管理与错误恢复
系统实现了完善的连接管理和错误恢复策略。

```mermaid
flowchart TD
Start([连接建立]) --> MonitorConnection["监控连接状态"]
MonitorConnection --> ConnectionActive{"连接活跃?"}
ConnectionActive --> |是| ContinueNormal["正常数据传输"]
ConnectionActive --> |否| DetectError["检测错误类型"]
DetectError --> NetworkError{"网络错误?"}
DetectError --> TimeoutError{"超时错误?"}
DetectError --> ServerError{"服务器错误?"}
NetworkError --> |是| RetryImmediately["立即重试"]
TimeoutError --> |是| RetryWithDelay["延迟后重试"]
ServerError --> |是| RetryWithBackoff["指数退避重试"]
RetryImmediately --> Reconnect["重新建立连接"]
RetryWithDelay --> Wait["等待延迟时间"]
Wait --> Reconnect
RetryWithBackoff --> CalculateDelay["计算退避延迟"]
CalculateDelay --> Wait
Reconnect --> CheckReconnect["检查重连结果"]
CheckReconnect --> ReconnectSuccess{"重连成功?"}
ReconnectSuccess --> |是| ResumeTransmission["恢复数据传输"]
ReconnectSuccess --> |否| MaxRetries{"达到最大重试次数?"}
MaxRetries --> |是| NotifyUser["通知用户"]
MaxRetries --> |否| RetryAgain["再次重试"]
ResumeTransmission --> MonitorConnection
NotifyUser --> End([连接失败])
```

**Diagram sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L324-L342)

**Section sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L324-L342)

## Vue组件中的API使用
在Vue组件中，可以通过导入`aiApi`来使用AI助手的API功能。

### 在Vue组件中调用API
`ai-chat-interface-fixed.vue`展示了如何在Vue组件中使用AI API。

```mermaid
sequenceDiagram
participant Component as "Vue组件"
participant Api as "aiApi"
participant Store as "AIStore"
Component->>Api : getModels()
Api->>Server : GET /api/ai/models
Server-->>Api : 返回模型列表
Api-->>Component : 返回模型数据
Component->>Store : 设置模型列表
Component->>Api : createConversation(data)
Api->>Server : POST /api/ai/conversations
Server-->>Api : 返回会话信息
Api-->>Component : 返回会话数据
Component->>Store : 设置当前会话
Component->>Api : sendMessage(conversationId, data)
Api->>Server : POST /api/ai/conversations/{id}/messages
Server-->>Api : 返回消息
Api-->>Component : 返回消息数据
Component->>Store : 添加消息到会话
```

**Diagram sources**
- [ai-chat-interface-fixed.vue](file://k.yyup.com/ai-chat-interface-fixed.vue#L198)
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts#L363-L371)

**Section sources**
- [ai-chat-interface-fixed.vue](file://k.yyup.com/ai-chat-interface-fixed.vue#L198)
- [ai.ts](file://k.yyup.com/client/src/api/ai.ts#L363-L371)

### 移动端AI助手实现
`MobileAiAssistant.vue`展示了移动端AI助手的实现。

```mermaid
classDiagram
class MobileAiAssistant {
+visible : boolean
+inputText : string
+voiceMode : boolean
+isTyping : boolean
+messages : ChatMessage[]
+suggestions : string[]
}
class ChatMessage {
+id : string
+type : 'user' | 'ai' | 'system'
+content : string
+timestamp : Date
}
class AiAssistantStore {
+sendMessage(content) : Promise<Response>
+startVoiceRecognition() : void
+speakText(text) : Promise<void>
}
MobileAiAssistant --> ChatMessage : "包含"
MobileAiAssistant --> AiAssistantStore : "依赖"
AiAssistantStore --> MobileAPIService : "依赖"
MobileAPIService --> fetch : "调用"
```

**Diagram sources**
- [MobileAiAssistant.vue](file://k.yyup.com/client/aimobile/components/MobileAiAssistant.vue#L296)
- [ai-assistant.ts](file://k.yyup.com/client/aimobile/stores/ai-assistant.ts#L62)
- [mobile-api.service.ts](file://k.yyup.com/client/aimobile/services/mobile-api.service.ts#L25)

**Section sources**
- [MobileAiAssistant.vue](file://k.yyup.com/client/aimobile/components/MobileAiAssistant.vue#L296)
- [ai-assistant.ts](file://k.yyup.com/client/aimobile/stores/ai-assistant.ts#L62)
- [mobile-api.service.ts](file://k.yyup.com/client/aimobile/services/mobile-api.service.ts#L25)

## 错误处理与重试机制
系统实现了完善的错误处理和重试机制，确保API调用的可靠性。

### 错误处理策略
错误处理策略涵盖了认证过期、网络错误和服务器错误等多种情况。

```mermaid
flowchart TD
Start([错误发生]) --> ClassifyError["分类错误类型"]
ClassifyError --> AuthError{"认证错误?"}
ClassifyError --> NetworkError{"网络错误?"}
ClassifyError --> ServerError{"服务器错误?"}
ClassifyError --> ClientError{"客户端错误?"}
AuthError --> |是| Handle401["处理401错误"]
Handle401 --> CheckTokenExpired["检查Token是否过期"]
CheckTokenExpired --> |是| RefreshToken["尝试刷新Token"]
CheckTokenExpired --> |否| RedirectToLogin["跳转到登录页"]
RefreshToken --> RefreshSuccess{"刷新成功?"}
RefreshSuccess --> |是| RetryRequest["重试原请求"]
RefreshSuccess --> |否| RedirectToLogin
NetworkError --> |是| ThrottleError["节流错误显示"]
NetworkError --> |是| SilentHandle["静默处理"]
ServerError --> |是| ShouldRetry{"应该重试?"}
ShouldRetry --> |是| RetryWithBackoff["指数退避重试"]
ShouldRetry --> |否| ShowError["显示错误信息"]
ClientError --> |是| ShowError
RetryWithBackoff --> MaxRetries{"达到最大重试次数?"}
MaxRetries --> |是| ShowError
MaxRetries --> |否| RetryAgain["再次重试"]
ShowError --> LogError["记录错误日志"]
LogError --> NotifyUser["通知用户"]
NotifyUser --> End([错误处理完成])
```

**Diagram sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L211-L316)

**Section sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L211-L316)

### 重试机制
重试机制通过`retryRequest`函数实现，支持多种错误类型的重试。

```mermaid
flowchart TD
Start([发起请求]) --> WrapRequest["包装请求函数"]
WrapRequest --> CallRetry["调用retryRequest"]
CallRetry --> TryRequest["尝试执行请求"]
TryRequest --> RequestSuccess{"请求成功?"}
RequestSuccess --> |是| ReturnResult["返回结果"]
RequestSuccess --> |否| CheckRetry["检查是否应该重试"]
CheckRetry --> ShouldRetry{"应该重试?"}
ShouldRetry --> |否| ThrowError["抛出错误"]
ShouldRetry --> |是| CheckMaxRetries["检查最大重试次数"]
CheckMaxRetries --> MaxRetriesReached{"达到最大重试次数?"}
MaxRetriesReached --> |是| ThrowError
MaxRetriesReached --> |否| LogRetry["记录重试日志"]
LogRetry --> Delay["延迟"]
Delay --> RetryRequest["重试请求"]
RetryRequest --> TryRequest
ReturnResult --> End([请求完成])
```

**Diagram sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L325-L342)

**Section sources**
- [request.ts](file://k.yyup.com/client/src/utils/request.ts#L325-L342)

## 总结
本文档详细分析了AI助手前端API客户端的实现，涵盖了核心API接口、会话管理模块、HTTP请求配置、SSE流式数据处理、Vue组件中的API使用以及错误处理与重试机制。通过这些详细的说明和示例，开发者可以更好地理解和使用AI助手的API功能，构建高效、可靠的AI应用。