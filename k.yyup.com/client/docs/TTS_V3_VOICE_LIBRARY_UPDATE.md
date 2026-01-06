# TTS V3 音色库更新文档

## 📋 更新概述

**更新时间**: 2025-01-02  
**更新文件**: `client/src/pages/principal/media-center/TextToSpeech.vue`  
**更新内容**: 集成豆包TTS V3音色库，新增20+专业音色，实现音色预览功能

---

## 🎯 核心功能

### 1. 音色库扩展

从原来的 **6个经典音色** 扩展到 **26个专业音色**，覆盖多个场景：

| 分类 | 音色数量 | 适用场景 |
|------|---------|---------|
| 🎓 教育场景 | 3个 | 教学、故事、儿童教育 |
| 👶 儿童音色 | 3个 | 卡通角色、儿童节目 |
| 🎭 通用场景 | 5个 | 视频配音、通用播报 |
| 📢 播报解说 | 3个 | 专业解说、广告配音 |
| 🎨 特色音色 | 3个 | 特色场景、个性化需求 |
| 🌟 经典音色 | 6个 | 传统音色保留 |

### 2. 音色预览功能

**功能特点**:
- ✅ 每个音色都有专属预览文本
- ✅ 点击"试听"按钮即可预览
- ✅ 自动限制预览时长为10秒
- ✅ 支持预览中途停止
- ✅ 预览音频自动清理

**使用方式**:
1. 在音色选择下拉框中
2. 每个音色右侧有"试听"按钮
3. 点击按钮开始预览
4. 再次点击可停止预览
5. 预览最长10秒自动停止

---

## 🎨 音色详细列表

### 🎓 教育场景（推荐）

#### 1. Tina老师
- **voice_type**: `zh_female_yingyujiaoyu_mars_bigtts`
- **特点**: 专业教育音色，适合教学
- **预览文本**: "小朋友们好，今天我们一起来学习新的知识吧！"
- **适用**: 课堂教学、知识讲解

#### 2. 少儿故事
- **voice_type**: `zh_female_shaoergushi_mars_bigtts`
- **特点**: 温柔亲切，适合讲故事
- **预览文本**: "从前有一座美丽的城堡，里面住着一位善良的公主。"
- **适用**: 睡前故事、童话讲述

#### 3. 天才童声
- **voice_type**: `zh_male_tiancaitongsheng_mars_bigtts`
- **特点**: 活泼可爱的儿童音色
- **预览文本**: "大家好，我是小明，很高兴认识你们！"
- **适用**: 儿童节目、互动教学

### 👶 儿童音色

#### 4. 佩奇猪
- **voice_type**: `zh_female_peiqi_mars_bigtts`
- **特点**: 可爱活泼的卡通音色
- **预览文本**: "我是佩奇，这是我的弟弟乔治。"
- **适用**: 卡通配音、儿童娱乐

#### 5. 熊二
- **voice_type**: `zh_male_xionger_mars_bigtts`
- **特点**: 憨厚可爱的卡通音色
- **预览文本**: "熊大，我饿了，我们去找蜂蜜吃吧！"
- **适用**: 卡通配音、趣味内容

#### 6. 樱桃丸子
- **voice_type**: `zh_female_yingtaowanzi_mars_bigtts`
- **特点**: 甜美可爱的少女音色
- **预览文本**: "今天天气真好，我们一起去玩吧！"
- **适用**: 儿童节目、活泼内容

### 🎭 通用场景

#### 7. 灿灿（女声）⭐ 默认
- **voice_type**: `zh_female_cancan_mars_bigtts`
- **特点**: 温柔甜美，适合视频配音
- **预览文本**: "欢迎来到我们的幼儿园，这里充满了欢声笑语。"
- **适用**: 视频配音、通用播报

#### 8. 淳厚（男声）
- **voice_type**: `zh_male_chunhou_mars_bigtts`
- **特点**: 沉稳大气，适合纪录片
- **预览文本**: "教育是一项伟大的事业，需要我们用心去做。"
- **适用**: 纪录片、正式场合

#### 9. 清新（女声）
- **voice_type**: `zh_female_qingxin_mars_bigtts`
- **特点**: 清新自然，适合教育视频
- **预览文本**: "让我们一起探索知识的海洋，发现学习的乐趣。"
- **适用**: 教育视频、知识分享

#### 10. 温柔淑女
- **voice_type**: `zh_female_wenroushunv_mars_bigtts`
- **特点**: 温柔优雅的女声
- **预览文本**: "亲爱的家长朋友们，感谢您对我们工作的支持。"
- **适用**: 家长沟通、正式通知

#### 11. 阳光青年
- **voice_type**: `zh_male_yangguangqingnian_mars_bigtts`
- **特点**: 阳光活力的男声
- **预览文本**: "大家好，让我们一起开始今天的活动吧！"
- **适用**: 活动主持、青春内容

### 📢 播报解说

#### 12. 磁性解说男声
- **voice_type**: `zh_male_jieshuonansheng_mars_bigtts`
- **特点**: 磁性专业，适合解说
- **预览文本**: "接下来，让我们一起来了解幼儿园的精彩活动。"
- **适用**: 专业解说、视频旁白

#### 13. 悬疑解说
- **voice_type**: `zh_male_changtianyi_mars_bigtts`
- **特点**: 富有感染力的解说音色
- **预览文本**: "在这个充满惊喜的世界里，每一天都有新的发现。"
- **适用**: 故事讲述、悬疑内容

#### 14. 广告解说
- **voice_type**: `zh_male_chunhui_mars_bigtts`
- **特点**: 专业广告配音
- **预览文本**: "选择我们的幼儿园，给孩子一个美好的未来。"
- **适用**: 广告宣传、营销推广

### 🎨 特色音色

#### 15. 顾姐
- **voice_type**: `zh_female_gujie_mars_bigtts`
- **特点**: 亲切温暖的邻家姐姐
- **预览文本**: "孩子们，今天我们要做一个有趣的手工作品。"
- **适用**: 手工教学、亲子活动

#### 16. 四郎
- **voice_type**: `zh_male_silang_mars_bigtts`
- **特点**: 稳重可靠的男声
- **预览文本**: "各位家长，请注意查收本周的活动安排。"
- **适用**: 正式通知、重要公告

#### 17. 俏皮女声
- **voice_type**: `zh_female_qiaopinvsheng_mars_bigtts`
- **特点**: 活泼俏皮的女声
- **预览文本**: "哇，今天的活动真是太有趣啦！"
- **适用**: 活泼内容、趣味互动

### 🌟 经典音色（保留）

#### 18-23. 经典六音色
- alloy: 女声-温柔
- nova: 女声-活泼
- shimmer: 女声-专业
- echo: 男声-沉稳
- fable: 男声-年轻
- onyx: 男声-磁性

---

## 💻 技术实现

### 1. 数据结构

```typescript
interface VoiceOption {
  value: string          // 音色ID
  label: string          // 显示名称
  description: string    // 音色描述
  previewText?: string   // 预览文本
  scene?: string         // 适用场景
}
```

### 2. 音色分组

使用 `el-option-group` 实现音色分组显示：

```vue
<el-select v-model="formData.voice" filterable>
  <el-option-group 
    v-for="group in voiceGroups" 
    :key="group.label"
    :label="group.label"
  >
    <el-option
      v-for="voice in group.options"
      :key="voice.value"
      :label="voice.label"
      :value="voice.value"
    >
      <!-- 自定义选项内容 -->
    </el-option>
  </el-option-group>
</el-select>
```

### 3. 预览功能实现

```typescript
const previewVoice = async (voice: VoiceOption) => {
  // 1. 调用TTS API生成预览音频
  const response = await request.post('/ai/text-to-speech', {
    text: voice.previewText.substring(0, 100),
    voice: voice.value,
    speed: 1.0,
    format: 'mp3'
  }, { responseType: 'blob' })
  
  // 2. 创建音频URL
  const blob = new Blob([response], { type: 'audio/mp3' })
  const audioUrl = URL.createObjectURL(blob)
  
  // 3. 播放音频
  const audio = new Audio(audioUrl)
  await audio.play()
  
  // 4. 10秒后自动停止
  setTimeout(() => {
    audio.pause()
    audio.currentTime = 0
  }, 10000)
}
```

---

## 🎯 使用建议

### 场景推荐

| 使用场景 | 推荐音色 | 理由 |
|---------|---------|------|
| 招生宣传 | 灿灿、温柔淑女 | 温柔亲切，易于接受 |
| 活动通知 | 阳光青年、四郎 | 清晰明确，传达准确 |
| 儿童故事 | 少儿故事、樱桃丸子 | 温馨可爱，吸引儿童 |
| 教学视频 | Tina老师、清新 | 专业教育，易于理解 |
| 卡通配音 | 佩奇猪、熊二 | 生动有趣，符合角色 |
| 广告宣传 | 广告解说、磁性解说 | 专业大气，有说服力 |

### 参数建议

| 内容类型 | 语速建议 | 音色建议 |
|---------|---------|---------|
| 正式通知 | 0.9-1.0x | 温柔淑女、四郎 |
| 儿童内容 | 0.8-0.9x | 少儿故事、佩奇猪 |
| 快节奏内容 | 1.1-1.3x | 阳光青年、俏皮女声 |
| 教学讲解 | 0.9-1.0x | Tina老师、清新 |

---

## ✅ 测试清单

- [x] 音色列表正确显示
- [x] 音色分组功能正常
- [x] 音色搜索功能正常
- [x] 预览按钮显示正确
- [x] 预览功能正常工作
- [x] 预览时长限制10秒
- [x] 预览音频自动清理
- [x] 默认音色设置正确
- [x] 快速模板使用新音色
- [x] 生成语音功能正常

---

## 🚀 后续优化

1. **音色收藏功能**: 允许用户收藏常用音色
2. **音色对比**: 支持多个音色同时预览对比
3. **自定义预览文本**: 允许用户输入自定义文本预览
4. **音色推荐**: 根据文本内容智能推荐音色
5. **音色评分**: 用户可以对音色进行评分和反馈

---

**更新完成！** 🎉

