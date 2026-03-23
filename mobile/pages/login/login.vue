<template>
  <view class="login-container">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <view class="logo">🦞</view>
      <text class="app-name">赚好多能虾助手</text>
      <text class="app-slogan">你的 AI 智能助手</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 手机号登录 -->
      <view class="form-section" v-if="loginType === 'phone'">
        <view class="input-group">
          <text class="input-icon">📱</text>
          <input
            class="input"
            type="number"
            v-model="phone"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </view>

        <view class="input-group">
          <text class="input-icon">🔐</text>
          <input
            class="input"
            type="number"
            v-model="code"
            placeholder="请输入验证码"
            maxlength="6"
          />
          <button
            class="code-btn"
            :disabled="countdown > 0"
            @tap="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </button>
        </view>

        <button class="login-btn" @tap="loginByPhone">
          登录 / 注册
        </button>
      </view>

      <!-- 微信登录 -->
      <view class="form-section" v-if="loginType === 'wechat'">
        <button class="wechat-btn" @tap="loginByWechat">
          <text class="wechat-icon">💬</text>
          <text>微信一键登录</text>
        </button>
      </view>

      <!-- 切换登录方式 -->
      <view class="switch-section">
        <text class="switch-text">其他登录方式：</text>
        <text
          class="switch-link"
          @tap="toggleLoginType"
        >
          {{ loginType === 'phone' ? '微信登录' : '手机号登录' }}
        </text>
      </view>

      <!-- 用户协议 -->
      <view class="agreement-section">
        <checkbox-group @change="onAgreementChange">
          <label class="agreement-label">
            <checkbox :checked="agreed" color="#E74C3C" />
            <text class="agreement-text">
              我已阅读并同意
              <text class="link" @tap="openAgreement('user')">《用户协议》</text>
              和
              <text class="link" @tap="openAgreement('privacy')">《隐私政策》</text>
            </text>
          </label>
        </checkbox-group>
      </view>
    </view>

    <!-- 加载提示 -->
    <view class="loading-mask" v-if="loading">
      <view class="loading-content">
        <view class="loader"></view>
        <text>{{ loadingText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/utils/config'

export default {
  data() {
    return {
      loginType: 'phone', // 'phone' | 'wechat'
      phone: '',
      code: '',
      countdown: 0,
      loading: false,
      loadingText: '',
      agreed: false
    }
  },

  onLoad() {
    // 检查是否已登录
    this.checkLoginStatus()
  },

  methods: {
    // 检查登录状态
    async checkLoginStatus() {
      const token = uni.getStorageSync('token')
      if (token) {
        // 已登录，跳转到首页
        uni.switchTab({
          url: '/pages/index/index'
        })
      }
    },

    // 切换登录方式
    toggleLoginType() {
      this.loginType = this.loginType === 'phone' ? 'wechat' : 'phone'
    },

    // 发送验证码
    async sendCode() {
      // 验证手机号
      if (!this.validatePhone()) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }

      // 检查协议
      if (!this.agreed) {
        uni.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        })
        return
      }

      // 发送验证码
      this.loading = true
      this.loadingText = '正在发送验证码...'

      try {
        const response = await uni.request({
          url: `${API_BASE_URL}/api/v1/auth/send-code`,
          method: 'POST',
          data: {
            phone: this.phone,
            type: 'register'
          }
        })

        if (response[1].statusCode === 200) {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })

          // 开始倒计时
          this.startCountdown()

          // 开发模式：显示验证码
          if (process.env.NODE_ENV === 'development') {
            console.log('验证码已发送到控制台')
          }
        } else {
          throw new Error(response[1].data.message || '发送失败')
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        uni.showToast({
          title: error.message || '发送失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.loadingText = ''
      }
    },

    // 手机号登录
    async loginByPhone() {
      // 验证
      if (!this.validatePhone()) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }

      if (!this.code || this.code.length !== 6) {
        uni.showToast({
          title: '请输入 6 位验证码',
          icon: 'none'
        })
        return
      }

      if (!this.agreed) {
        uni.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        })
        return
      }

      // 登录
      this.loading = true
      this.loadingText = '正在登录...'

      try {
        const response = await uni.request({
          url: `${API_BASE_URL}/api/v1/auth/login/phone`,
          method: 'POST',
          data: {
            phone: this.phone,
            code: this.code
          }
        })

        if (response[1].statusCode === 200) {
          const { token, user } = response[1].data.data

          // 保存登录信息
          uni.setStorageSync('token', token)
          uni.setStorageSync('userInfo', user)

          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })

          // 跳转到首页
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1000)
        } else {
          throw new Error(response[1].data.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
        uni.showToast({
          title: error.message || '登录失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.loadingText = ''
      }
    },

    // 微信登录
    async loginByWechat() {
      // 检查协议
      if (!this.agreed) {
        uni.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        })
        return
      }

      this.loading = true
      this.loadingText = '正在获取微信授权...'

      try {
        // 微信登录
        const loginResult = await uni.login({
          provider: 'weixin'
        })

        if (loginResult.errMsg !== 'login:ok') {
          throw new Error('微信登录失败')
        }

        this.loadingText = '正在登录...'

        // 调用后端 API
        const response = await uni.request({
          url: `${API_BASE_URL}/api/v1/auth/wechat`,
          method: 'POST',
          data: {
            code: loginResult.code
          }
        })

        if (response[1].statusCode === 200) {
          const { token, user, isNewUser } = response[1].data.data

          // 保存登录信息
          uni.setStorageSync('token', token)
          uni.setStorageSync('userInfo', user)

          uni.showToast({
            title: isNewUser ? '注册成功' : '登录成功',
            icon: 'success'
          })

          // 跳转到首页
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1000)
        } else {
          throw new Error(response[1].data.message || '登录失败')
        }
      } catch (error) {
        console.error('微信登录失败:', error)
        uni.showToast({
          title: error.message || '登录失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.loadingText = ''
      }
    },

    // 验证手机号
    validatePhone() {
      const phoneRegex = /^1[3-9]\d{9}$/
      return phoneRegex.test(this.phone)
    },

    // 开始倒计时
    startCountdown() {
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },

    // 协议变更
    onAgreementChange(e) {
      this.agreed = e.detail.value.length > 0
    },

    // 打开协议
    openAgreement(type) {
      const url = type === 'user'
        ? '/pages/agreement/user'
        : '/pages/agreement/privacy'

      uni.navigateTo({
        url
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 30px;
}

/* Logo 区域 */
.logo-section {
  text-align: center;
  margin-bottom: 60px;
}

.logo {
  font-size: 80px;
  margin-bottom: 20px;
}

.app-name {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
}

.app-slogan {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 登录表单 */
.login-form {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
}

.form-section {
  margin-bottom: 30px;
}

.input-group {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}

.input-icon {
  font-size: 20px;
  margin-right: 10px;
}

.input {
  flex: 1;
  font-size: 16px;
  height: 40px;
}

.code-btn {
  background: #E74C3C;
  color: white;
  font-size: 13px;
  padding: 8px 15px;
  border-radius: 8px;
  border: none;
  white-space: nowrap;
}

.code-btn:disabled {
  background: #ccc;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 18px;
  font-weight: bold;
  padding: 15px;
  border-radius: 10px;
  border: none;
  margin-top: 20px;
}

.wechat-btn {
  background: #07C160;
  color: white;
  font-size: 18px;
  font-weight: bold;
  padding: 15px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wechat-icon {
  font-size: 20px;
  margin-right: 10px;
}

/* 切换登录方式 */
.switch-section {
  text-align: center;
  margin-top: 20px;
}

.switch-text {
  color: #666;
  font-size: 14px;
  margin-right: 10px;
}

.switch-link {
  color: #667eea;
  font-size: 14px;
  text-decoration: underline;
}

/* 用户协议 */
.agreement-section {
  margin-top: 30px;
}

.agreement-label {
  display: flex;
  align-items: flex-start;
}

.agreement-text {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.link {
  color: #667eea;
  text-decoration: underline;
}

/* 加载提示 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
