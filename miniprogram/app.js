App({
  globalData: {
    userInfo: null,
    token: null,
    apiBaseUrl: 'http://xiabot.cn'
  },
  
  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  }
})
