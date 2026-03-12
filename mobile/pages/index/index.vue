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
              </view>
              <text class="message-time">{{msg.time}}</text>
            </view>
          </view>
          
          <!-- 我的消息 -->
          <view v-else class="message user">
            <view class="message-content">
              <view class="message-bubble">
                <text>{{msg.content}}</text>
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
        <view class="voice-btn" @tap="startVoice">
          <text class="icon">🎤</text>
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
export default {
  data() {
    return {
      scrollToView: '',
      inputText: '',
      isLoading: false,
      messages: [
        {
          role: 'assistant',
          content: '你好！我是龙虾 Agent，可以帮你处理 Excel、写周报、搜索报告等。有什么可以帮你的？',
          time: this.getCurrentTime()
        }
      ],
      quickActions: [
        { icon: '📊', text: '分析 Excel', type: 'excel' },
        { icon: '📝', text: '写周报', type: 'weekly_report' },
        { icon: '🔍', text: '搜索报告', type: 'search' },
        { icon: '✉️', text: '写邮件', type: 'email' },
        { icon: '📈', text: '生成图表', type: 'chart' }
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
    
    sendMessage() {
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
      this.callAI(userMessage)
    },
    
    async callAI(message) {
      this.isLoading = true
      
      try {
        // TODO: 调用云侧 API
        // const response = await uni.request({
        //   url: 'https://api.lobster-app.com/v1/chat',
        //   method: 'POST',
        //   data: { message }
        // })
        
        // 模拟响应
        setTimeout(() => {
          this.messages.push({
            role: 'assistant',
            content: '收到！我正在处理你的请求："'+ message +'"。稍后会给你详细回复。',
            time: this.getCurrentTime()
          })
          this.isLoading = false
          this.scrollToView = 'msg-' + (this.messages.length - 1)
        }, 1500)
        
      } catch (error) {
        console.error('AI 调用失败:', error)
        this.isLoading = false
        uni.showToast({
          title: '请求失败，请重试',
          icon: 'none'
        })
      }
    },
    
    selectAction(action) {
      this.inputText = action.text
      // 可以直接发送，也可以让用户编辑
      // this.sendMessage()
    },
    
    uploadFile() {
      uni.chooseMessage({
        type: 'file',
        success: (res) => {
          console.log('选择文件:', res)
          // TODO: 上传文件
          uni.showToast({
            title: '文件选择成功',
            icon: 'success'
          })
        }
      })
    },
    
    startVoice() {
      // TODO: 语音输入
      uni.showToast({
        title: '语音功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #F5F5F5;
}

/* 头部 */
.header {
  padding: 20px 15px;
  background: linear-gradient(135deg, #E74C3C, #C0392B);
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
  background-color: white;
  border-bottom-left-radius: 4px;
}

.message.user .message-bubble {
  background-color: #E74C3C;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.loading {
  background-color: #f0f0f0;
  color: #999;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 5px;
  text-align: center;
}

/* 输入区域 */
.input-container {
  background-color: white;
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
  background-color: #f8f8f8;
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
  background-color: #f5f5f5;
  border-radius: 20px;
  font-size: 15px;
}

.send-btn {
  opacity: 0.5;
}

.send-btn.active {
  opacity: 1;
}
</style>
