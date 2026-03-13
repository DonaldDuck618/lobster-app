<template>
  <view class="container">
    <!-- 顶部欢迎区域 -->
    <view class="header">
      <view class="welcome-text">
        <text class="title">🦞 龙虾 Agent</text>
        <text class="subtitle">你的 AI 智能助手</text>
      </view>
    </view>

    <!-- 对话区域 -->
    <view class="chat-container">
      <scroll-view 
        class="message-list" 
        scroll-y 
        scroll-into-view="{{scrollToView}}"
        scroll-with-animation
      >
        <view v-for="(msg, index) in messages" :key="index" :id="'msg-' + index">
          <!-- 对方消息 -->
          <view v-if="msg.role === 'assistant'" class="message assistant">
            <view class="avatar">🦞</view>
            <view class="message-content">
              <view class="message-bubble">
                <text>{{msg.content}}</text>
                <!-- 图片消息 -->
                <image v-if="msg.image" :src="msg.image" mode="widthFix" class="message-image" />
              </view>
              <text class="message-time">{{msg.time}}</text>
            </view>
          </view>
          
          <!-- 我的消息 -->
          <view v-else class="message user">
            <view class="message-content">
              <view class="message-bubble">
                <text>{{msg.content}}</text>
                <!-- 图片消息 -->
                <image v-if="msg.image" :src="msg.image" mode="widthFix" class="message-image" />
              </view>
              <text class="message-time">{{msg.time}}</text>
            </view>
            <view class="avatar">👤</view>
          </view>
        </view>
        
        <!-- 加载中 -->
        <view v-if="isLoading" class="message assistant">
          <view class="avatar">🦞</view>
          <view class="message-content">
            <view class="message-bubble loading">
              <text>正在思考中...</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 输入区域 -->
    <view class="input-container">
      <!-- 快捷指令 -->
      <scroll-view class="quick-actions" scroll-x>
        <view 
          v-for="(action, index) in quickActions" 
          :key="index"
          class="action-btn"
          @tap="selectAction(action)"
        >
          <text class="action-icon">{{action.icon}}</text>
          <text class="action-text">{{action.text}}</text>
        </view>
      </scroll-view>
      
      <!-- 输入框 -->
      <view class="input-box">
        <!-- 拍照/图片按钮 -->
        <view class="image-btn" @tap="uploadImage">
          <text class="icon">📸</text>
        </view>
        
        <!-- 文件按钮 -->
        <view class="file-btn" @tap="uploadFile">
          <text class="icon">📎</text>
        </view>
        
        <input 
          class="input" 
          v-model="inputText"
          placeholder="输入任务描述..."
          confirm-type="send"
          @confirm="sendMessage"
        />
        
        <!-- 语音按钮 -->
        <view class="voice-btn" @tap="startVoice" :class="{recording: isRecording}">
          <text class="icon">{{isRecording ? '⏹️' : '🎤'}}</text>
        </view>
        
        <view 
          class="send-btn" 
          :class="{active: inputText.trim()}"
          @tap="sendMessage"
        >
          <text class="icon">📤</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/utils/config'

export default {
  data() {
    return {
      scrollToView: '',
      inputText: '',
      isLoading: false,
      isRecording: false,
      messages: [
        {
          role: 'assistant',
          content: '你好！我是龙虾汤，可以帮你处理 Excel、写周报、搜索报告等。有什么可以帮你的？',
          time: this.getCurrentTime()
        }
      ],
      quickActions: [
        { icon: '📊', text: '分析 Excel', type: 'excel' },
        { icon: '📝', text: '写周报', type: 'weekly_report' },
        { icon: '🔍', text: '搜索报告', type: 'search' },
        { icon: '✉️', text: '写邮件', type: 'email' },
        { icon: '📈', text: '生成图表', type: 'chart' },
        { icon: '📸', text: '拍照识别', type: 'ocr' },
        { icon: '🎤', text: '语音输入', type: 'voice' }
      ]
    }
  },

  onLoad() {
    // 页面加载
  },

  methods: {
    getCurrentTime() {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    
    // 发送消息
    async sendMessage() {
      if (!this.inputText.trim()) return
      
      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: this.inputText,
        time: this.getCurrentTime()
      })
      
      const userMessage = this.inputText
      this.inputText = ''
      this.scrollToView = 'msg-' + (this.messages.length - 1)
      
      // 调用 AI
      await this.callAI(userMessage)
    },
    
    // 上传图片
    async uploadImage() {
      const that = this
      uni.chooseImage({
        count: 1,
        sourceType: ['camera', 'album'],
        success: function(res) {
          const tempFilePath = res.tempFilePaths[0]
          
          // 显示图片消息
          that.messages.push({
            role: 'user',
            content: '请识别这张图片',
            image: tempFilePath,
            time: that.getCurrentTime()
          })
          
          // 调用 OCR 识别
          that.callOCR(tempFilePath)
        }
      })
    },
    
    // OCR 识别
    async callOCR(imagePath) {
      this.isLoading = true
      
      const token = uni.getStorageSync('token')
      
      uni.uploadFile({
        url: API_BASE_URL + '/api/v1/vision/ocr',
        filePath: imagePath,
        name: 'image',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.success) {
            this.messages.push({
              role: 'assistant',
              content: `📸 图片识别成功：\n${data.data.text}`,
              time: this.getCurrentTime()
            })
          } else {
            this.messages.push({
              role: 'assistant',
              content: '❌ 识别失败，请重试',
              time: this.getCurrentTime()
            })
          }
        },
        fail: (err) => {
          console.error('OCR 识别失败', err)
          this.messages.push({
            role: 'assistant',
            content: '❌ 识别失败，请重试',
            time: this.getCurrentTime()
          })
        },
        complete: () => {
          this.isLoading = false
        }
      })
    },
    
    // 上传文件
    uploadFile() {
      uni.chooseMessage({
        type: 'file',
        success: (res) => {
          console.log('选择文件:', res)
          uni.showToast({
            title: '文件选择成功',
            icon: 'success'
          })
        }
      })
    },
    
    // 语音输入
    startVoice() {
      if (this.isRecording) {
        // 停止录音
        this.isRecording = false
        uni.stopRecord()
        uni.showToast({
          title: '录音已停止',
          icon: 'success'
        })
      } else {
        // 开始录音
        this.isRecording = true
        uni.startRecord({
          success: (res) => {
            const tempFilePath = res.tempFilePath
            this.isRecording = false
            
            // 显示语音消息
            this.messages.push({
              role: 'user',
              content: '🎤 [语音消息]',
              time: this.getCurrentTime()
            })
            
            // 调用语音识别
            this.callSpeechToText(tempFilePath)
          },
          fail: (err) => {
            console.error('录音失败', err)
            this.isRecording = false
            uni.showToast({
              title: '录音失败',
              icon: 'none'
            })
          }
        })
        
        uni.showToast({
          title: '正在录音...',
          icon: 'none'
        })
      }
    },
    
    // 语音转文字
    async callSpeechToText(audioPath) {
      this.isLoading = true
      
      const token = uni.getStorageSync('token')
      
      uni.uploadFile({
        url: API_BASE_URL + '/api/v1/audio/transcribe',
        filePath: audioPath,
        name: 'audio',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.success) {
            this.messages.push({
              role: 'assistant',
              content: `🎤 语音识别结果：\n${data.data.text}`,
              time: this.getCurrentTime()
            })
          } else {
            this.messages.push({
              role: 'assistant',
              content: '❌ 识别失败，请重试',
              time: this.getCurrentTime()
            })
          }
        },
        fail: (err) => {
          console.error('语音识别失败', err)
          this.messages.push({
            role: 'assistant',
            content: '❌ 识别失败，请重试',
            time: this.getCurrentTime()
          })
        },
        complete: () => {
          this.isLoading = false
        }
      })
    },
    
    // 选择快捷指令
    selectAction(action) {
      this.inputText = action.text
      // 可以直接发送，也可以让用户编辑
      // this.sendMessage()
    },
    
    // 调用 AI
    async callAI(message) {
      this.isLoading = true
      
      try {
        const token = uni.getStorageSync('token') || ''
        
        const response = await uni.request({
          url: API_BASE_URL + '/api/v1/chat/send',
          method: 'POST',
          data: {
            message: message
          },
          header: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response[1].statusCode === 200) {
          const result = response[1].data
          if (result.success) {
            this.messages.push({
              role: 'assistant',
              content: result.data.response || '收到你的消息',
              time: this.getCurrentTime()
            })
          } else {
            this.messages.push({
              role: 'assistant',
              content: '抱歉，处理失败，请重试',
              time: this.getCurrentTime()
            })
          }
        } else {
          throw new Error(response[1].data.message || '请求失败')
        }
      } catch (error) {
        console.error('AI 调用失败:', error)
        
        // 开发模式：模拟响应
        this.messages.push({
          role: 'assistant',
          content: `收到："${message}"\n\n（开发模式：API 尚未对接真实 AI）`,
          time: this.getCurrentTime()
        })
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

/* 头部 */
.header {
  padding: 20px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-text {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

/* 对话区域 */
.chat-container {
  flex: 1;
  overflow: hidden;
}

.message-list {
  height: 100%;
  padding: 15px;
}

.message {
  display: flex;
  margin-bottom: 20px;
}

.message.assistant {
  flex-direction: row;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  font-size: 40px;
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
}

.message.assistant .message-bubble {
  background: white;
  border-bottom-left-radius: 4px;
}

.message.user .message-bubble {
  background: #667eea;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.loading {
  background: #f0f0f0;
  color: #999;
}

.message-image {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 5px;
  text-align: center;
}

/* 输入区域 */
.input-container {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding-bottom: env(safe-area-inset-bottom);
}

.quick-actions {
  white-space: nowrap;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f8f8;
  border-radius: 20px;
  margin-right: 10px;
}

.action-icon {
  font-size: 18px;
  margin-right: 5px;
}

.action-text {
  font-size: 13px;
  color: #333;
}

.input-box {
  display: flex;
  align-items: center;
  padding: 10px 15px;
}

.image-btn,
.file-btn,
.voice-btn,
.send-btn {
  padding: 8px;
  margin: 0 5px;
}

.icon {
  font-size: 24px;
}

.input {
  flex: 1;
  height: 40px;
  padding: 0 15px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 15px;
}

.voice-btn.recording {
  background: #ff4444;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.send-btn {
  opacity: 0.5;
}

.send-btn.active {
  opacity: 1;
  background: #667eea;
  border-radius: 50%;
}
</style>
