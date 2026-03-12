<script>
export default {
  onLaunch: function() {
    console.log('🦞 龙虾 Agent 启动')
    // 初始化检查
    this.checkUpdate()
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    checkUpdate() {
      // 检查版本更新
      const updateManager = uni.getUpdateManager()
      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            uni.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function(res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
        }
      })
    }
  }
}
</script>

<style>
/* 全局样式 */
page {
  background-color: #F8F8F8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333333;
}

/* 龙虾红主色 */
.lobster-red {
  color: #E74C3C;
}

.lobster-bg {
  background-color: #E74C3C;
}

/* 通用工具类 */
.flex {
  display: flex;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mt-10 {
  margin-top: 10px;
}

.mb-10 {
  margin-bottom: 10px;
}

.p-10 {
  padding: 10px;
}

.text-center {
  text-align: center;
}

.text-gray {
  color: #999999;
}

.text-small {
  font-size: 12px;
}

.card {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 15px;
  margin: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-primary {
  background-color: #E74C3C;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
}

.btn-primary:active {
  background-color: #C0392B;
}
</style>
