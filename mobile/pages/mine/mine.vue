<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-area">
        <view class="avatar">👤</view>
        <view class="user-info">
          <text class="username">Duck Donald</text>
          <view class="vip-badge">
            <text class="badge-text">🦞 钻石会员</text>
          </view>
          <text class="vip-days">剩余 256 天</text>
        </view>
      </view>
    </view>

    <!-- 使用统计 -->
    <view class="stats-card card">
      <view class="card-title">📊 本月使用</view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">156</text>
          <text class="stat-label">Agent 调用</text>
          <text class="stat-sub">无限次</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">23</text>
          <text class="stat-label">文件处理</text>
          <text class="stat-sub">50 个</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">12</text>
          <text class="stat-label">报告生成</text>
          <text class="stat-sub">20 份</text>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-card card">
      <view class="menu-item" @tap="goToPage('subscription')">
        <text class="menu-icon">💳</text>
        <text class="menu-text">订阅管理</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToPage('settings')">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToPage('help')">
        <text class="menu-icon">❓</text>
        <text class="menu-text">帮助与反馈</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToPage('about')">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" @tap="logout">
      <text>退出登录</text>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text>版本 1.0.0 (2026-03-12)</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        name: 'Duck Donald',
        avatar: '',
        vipLevel: 'diamond',
        vipDays: 256
      }
    }
  },
  methods: {
    goToPage(page) {
      console.log('跳转到:', page)
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 退出登录逻辑
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 30px;
}

/* 用户卡片 */
.user-card {
  background: linear-gradient(135deg, #E74C3C, #C0392B);
  padding: 30px 20px 80px;
  color: white;
}

.avatar-area {
  display: flex;
  align-items: center;
}

.avatar {
  font-size: 60px;
  margin-right: 15px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 8px;
}

.vip-badge {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 5px;
}

.badge-text {
  font-size: 12px;
}

.vip-days {
  font-size: 13px;
  opacity: 0.9;
}

/* 统计卡片 */
.stats-card {
  margin: -50px 15px 15px;
  position: relative;
  z-index: 10;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #E74C3C;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 3px;
}

.stat-sub {
  font-size: 11px;
  color: #999;
}

/* 菜单列表 */
.menu-card {
  margin: 15px;
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 20px;
  margin-right: 15px;
}

.menu-text {
  flex: 1;
  font-size: 15px;
}

.menu-arrow {
  font-size: 20px;
  color: #ccc;
}

/* 退出按钮 */
.logout-btn {
  margin: 30px 15px;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  text-align: center;
  color: #E74C3C;
  font-size: 15px;
}

/* 版本信息 */
.version-info {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 20px;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
