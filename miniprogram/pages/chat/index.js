const app = getApp()

Page({
  data: {
    messages: [],
    inputText: '',
    scrollToView: ''
  },

  onLoad() {
    this.checkLogin();
  },

  checkLogin() {
    if (!app.globalData.token) {
      wx.redirectTo({ url: '/pages/login/index' });
    }
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  async sendMessage() {
    const { inputText, messages } = this.data;
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: inputText,
      time: this.getCurrentTime()
    };

    messages.push(newMessage);
    this.setData({ 
      messages, 
      inputText: '',
      scrollToView: 'msg-' + newMessage.id
    });

    try {
      const response = await wx.request({
        url: `${app.globalData.apiBaseUrl}/api/v1/chat/send`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${app.globalData.token}`
        },
        data: { message: inputText }
      });

      if (response.statusCode === 200) {
        const aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.data?.response?.content || '收到你的消息',
          time: this.getCurrentTime()
        };
        messages.push(aiResponse);
        this.setData({ 
          messages,
          scrollToView: 'msg-' + aiResponse.id
        });
      }
    } catch (error) {
      console.error('发送失败:', error);
      wx.showToast({ title: '发送失败', icon: 'none' });
    }
  },

  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
})
