<template>
  <view class="data-container">
    <!-- 顶部统计 -->
    <view class="stats-header">
      <view class="stat-card">
        <text class="stat-value">{{stats.fileCount}}</text>
        <text class="stat-label">文件</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{stats.reportCount}}</text>
        <text class="stat-label">报告</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{stats.sessionCount}}</text>
        <text class="stat-label">会话</text>
      </view>
    </view>

    <!-- 选项卡 -->
    <view class="tabs">
      <view
        class="tab"
        :class="{ active: activeTab === 'files' }"
        @tap="switchTab('files')"
      >
        文件
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'reports' }"
        @tap="switchTab('reports')"
      >
        报告
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'sessions' }"
        @tap="switchTab('sessions')"
      >
        会话
      </view>
    </view>

    <!-- 文件列表 -->
    <view class="list-section" v-if="activeTab === 'files'">
      <scroll-view
        class="scroll-list"
        scroll-y
        refresher-enabled
        @refresherrefresh="onRefresh"
      >
        <!-- 空状态 -->
        <view class="empty-state" v-if="files.length === 0 && !loading">
          <text class="empty-icon">📁</text>
          <text class="empty-text">暂无文件</text>
          <text class="empty-hint">上传文件后在这里查看</text>
        </view>

        <!-- 文件列表 -->
        <view
          class="file-item"
          v-for="(file, index) in files"
          :key="index"
          @tap="openFile(file)"
        >
          <view class="file-icon">
            <text>{{getFileIcon(file.type)}}</text>
          </view>
          <view class="file-info">
            <text class="file-name">{{file.name}}</text>
            <text class="file-meta">
              {{formatFileSize(file.size)}} · {{formatDate(file.createdAt)}}
            </text>
          </view>
          <view class="file-action">
            <text class="action-icon">⋮</text>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore">
          <text>加载更多...</text>
        </view>
      </scroll-view>
    </view>

    <!-- 报告列表 -->
    <view class="list-section" v-if="activeTab === 'reports'">
      <scroll-view
        class="scroll-list"
        scroll-y
        refresher-enabled
        @refresherrefresh="onRefresh"
      >
        <!-- 空状态 -->
        <view class="empty-state" v-if="reports.length === 0 && !loading">
          <text class="empty-icon">📊</text>
          <text class="empty-text">暂无报告</text>
          <text class="empty-hint">生成报告后在这里查看</text>
        </view>

        <!-- 报告列表 -->
        <view
          class="report-item"
          v-for="(report, index) in reports"
          :key="index"
          @tap="openReport(report)"
        >
          <view class="report-header">
            <text class="report-title">{{report.title}}</text>
            <text class="report-type">{{report.type}}</text>
          </view>
          <text class="report-summary">{{report.summary}}</text>
          <text class="report-meta">{{formatDate(report.createdAt)}}</text>
        </view>

        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore">
          <text>加载更多...</text>
        </view>
      </scroll-view>
    </view>

    <!-- 会话列表 -->
    <view class="list-section" v-if="activeTab === 'sessions'">
      <scroll-view
        class="scroll-list"
        scroll-y
        refresher-enabled
        @refresherrefresh="onRefresh"
      >
        <!-- 空状态 -->
        <view class="empty-state" v-if="sessions.length === 0 && !loading">
          <text class="empty-icon">💬</text>
          <text class="empty-text">暂无会话</text>
          <text class="empty-hint">开始对话后在这里查看</text>
        </view>

        <!-- 会话列表 -->
        <view
          class="session-item"
          v-for="(session, index) in sessions"
          :key="index"
          @tap="openSession(session)"
        >
          <view class="session-avatar">🦞</view>
          <view class="session-content">
            <view class="session-header">
              <text class="session-title">{{session.title || '新会话'}}</text>
              <text class="session-time">{{formatTime(session.lastActiveAt)}}</text>
            </view>
            <text class="session-preview">{{session.lastMessage}}</text>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore">
          <text>加载更多...</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/utils/config'

export default {
  data() {
    return {
      activeTab: 'files',
      loading: false,
      hasMore: false,
      stats: {
        fileCount: 0,
        reportCount: 0,
        sessionCount: 0
      },
      files: [],
      reports: [],
      sessions: []
    }
  },

  onLoad() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.onRefresh()
  },

  methods: {
    // 加载数据
    async loadData() {
      this.loading = true

      try {
        const token = uni.getStorageSync('token')

        // 加载文件列表
        await this.loadFiles(token)

        // 加载报告列表
        await this.loadReports(token)

        // 加载会话列表
        await this.loadSessions(token)

        // 更新统计
        this.updateStats()
      } catch (error) {
        console.error('加载数据失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 加载文件
    async loadFiles(token) {
      try {
        const response = await uni.request({
          url: `${API_BASE_URL}/api/v1/files`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response[1].statusCode === 200) {
          this.files = response[1].data.data.files || []
        }
      } catch (error) {
        console.error('加载文件失败:', error)
      }
    },

    // 加载报告
    async loadReports(token) {
      // TODO: 实现报告列表 API
      this.reports = [
        {
          id: '1',
          title: '2026 年 Q1 销售分析报告',
          type: 'Excel 分析',
          summary: '总销售额 ¥5,678,900，同比增长 +23.5%',
          createdAt: new Date().toISOString()
        }
      ]
    },

    // 加载会话
    async loadSessions(token) {
      try {
        const response = await uni.request({
          url: `${API_BASE_URL}/api/v1/chat/sessions`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response[1].statusCode === 200) {
          this.sessions = response[1].data.data || []
        }
      } catch (error) {
        console.error('加载会话失败:', error)
      }
    },

    // 更新统计
    updateStats() {
      this.stats = {
        fileCount: this.files.length,
        reportCount: this.reports.length,
        sessionCount: this.sessions.length
      }
    },

    // 切换选项卡
    switchTab(tab) {
      this.activeTab = tab
    },

    // 刷新
    async onRefresh() {
      await this.loadData()
      uni.stopPullDownRefresh()
    },

    // 打开文件
    openFile(file) {
      uni.showActionSheet({
        itemList: ['查看', '下载', '删除'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 查看
          } else if (res.tapIndex === 1) {
            // 下载
          } else if (res.tapIndex === 2) {
            // 删除
          }
        }
      })
    },

    // 打开报告
    openReport(report) {
      uni.navigateTo({
        url: `/pages/report/detail?id=${report.id}`
      })
    },

    // 打开会话
    openSession(session) {
      uni.navigateTo({
        url: `/pages/index/index?sessionId=${session.id}`
      })
    },

    // 获取文件图标
    getFileIcon(type) {
      const icons = {
        excel: '📊',
        word: '📄',
        pdf: '📕',
        image: '🖼️',
        other: '📁'
      }
      return icons[type] || icons.other
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
      return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    },

    // 格式化日期
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

      return date.toLocaleDateString('zh-CN')
    },

    // 格式化时间
    formatTime(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.data-container {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 统计头部 */
.stats-header {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
}

.stat-card {
  flex: 1;
  text-align: center;
  color: white;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  display: block;
  font-size: 14px;
  opacity: 0.8;
}

/* 选项卡 */
.tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 15px;
  font-size: 16px;
  color: #666;
  border-bottom: 3px solid transparent;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: bold;
}

/* 列表区域 */
.list-section {
  height: calc(100vh - 200px);
}

.scroll-list {
  height: 100%;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  display: block;
  margin-bottom: 20px;
}

.empty-text {
  display: block;
  font-size: 18px;
  color: #666;
  margin-bottom: 10px;
}

.empty-hint {
  display: block;
  font-size: 14px;
  color: #999;
}

/* 文件项 */
.file-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 15px;
  margin: 10px;
  border-radius: 10px;
}

.file-icon {
  font-size: 40px;
  margin-right: 15px;
}

.file-info {
  flex: 1;
}

.file-name {
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.file-meta {
  display: block;
  font-size: 12px;
  color: #999;
}

.file-action {
  font-size: 24px;
  color: #999;
  padding: 10px;
}

/* 报告项 */
.report-item {
  background: white;
  padding: 15px;
  margin: 10px;
  border-radius: 10px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.report-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.report-type {
  font-size: 12px;
  color: white;
  background: #667eea;
  padding: 3px 8px;
  border-radius: 4px;
}

.report-summary {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.report-meta {
  display: block;
  font-size: 12px;
  color: #999;
}

/* 会话项 */
.session-item {
  display: flex;
  background: white;
  padding: 15px;
  margin: 10px;
  border-radius: 10px;
}

.session-avatar {
  font-size: 50px;
  margin-right: 15px;
}

.session-content {
  flex: 1;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.session-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.session-time {
  font-size: 12px;
  color: #999;
}

.session-preview {
  display: block;
  font-size: 14px;
  color: #666;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>
