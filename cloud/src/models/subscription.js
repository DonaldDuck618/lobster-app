/**
 * 订阅模型
 */

const { v4: uuidv4 } = require('uuid');

// 模拟数据库 (实际应该用 PostgreSQL)
const subscriptions = new Map();
const payments = new Map();

// 会员等级配置
const PLANS = {
  FREE: {
    id: 'free',
    name: '免费版',
    price: 0,
    currency: 'CNY',
    period: 'permanent',
    features: {
      dailyAgentCalls: 5,
      fileUpload: true,
      fileMaxSize: 10 * 1024 * 1024, // 10MB
      excelAnalysis: false,
      customSkills: false,
      teamCollaboration: false,
      prioritySupport: false,
      apiAccess: false
    }
  },
  STANDARD: {
    id: 'standard',
    name: '标准版',
    price: 19,
    currency: 'CNY',
    period: 'monthly',
    features: {
      dailyAgentCalls: -1, // 无限
      fileUpload: true,
      fileMaxSize: 100 * 1024 * 1024, // 100MB
      excelAnalysis: true,
      customSkills: true,
      teamCollaboration: false,
      prioritySupport: false,
      apiAccess: true
    }
  },
  PRO: {
    id: 'pro',
    name: '专业版',
    price: 39,
    currency: 'CNY',
    period: 'monthly',
    features: {
      dailyAgentCalls: -1,
      fileUpload: true,
      fileMaxSize: 500 * 1024 * 1024, // 500MB
      excelAnalysis: true,
      customSkills: true,
      teamCollaboration: true,
      prioritySupport: true,
      apiAccess: true
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: '企业版',
    price: 5000,
    currency: 'CNY',
    period: 'yearly',
    features: {
      dailyAgentCalls: -1,
      fileUpload: true,
      fileMaxSize: 1024 * 1024 * 1024, // 1GB
      excelAnalysis: true,
      customSkills: true,
      teamCollaboration: true,
      prioritySupport: true,
      apiAccess: true,
      privateDeployment: true,
      customDevelopment: true
    }
  }
};

class SubscriptionModel {
  /**
   * 创建订阅
   */
  static async create({ userId, planId, paymentMethod }) {
    const plan = PLANS[planId.toUpperCase()];
    
    if (!plan) {
      const error = new Error('无效的会员计划');
      error.status = 400;
      throw error;
    }

    // 检查是否有活跃订阅
    const existingSubscription = Array.from(subscriptions.values())
      .find(s => s.userId === userId && s.status === 'active');

    if (existingSubscription) {
      const error = new Error('已有活跃订阅，请先取消当前订阅');
      error.status = 400;
      throw error;
    }

    // 创建订阅
    const subscription = {
      id: uuidv4(),
      userId,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      currency: plan.currency,
      period: plan.period,
      status: 'pending', // pending, active, cancelled, expired
      startDate: null,
      endDate: null,
      autoRenew: plan.period === 'monthly',
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    subscriptions.set(subscription.id, subscription);

    return subscription;
  }

  /**
   * 激活订阅
   */
  static async activate(subscriptionId, paymentId) {
    const subscription = subscriptions.get(subscriptionId);
    
    if (!subscription) {
      const error = new Error('订阅不存在');
      error.status = 404;
      throw error;
    }

    // 验证支付
    const payment = payments.get(paymentId);
    if (!payment || payment.status !== 'success') {
      const error = new Error('支付未成功');
      error.status = 400;
      throw error;
    }

    // 激活订阅
    const now = new Date();
    subscription.status = 'active';
    subscription.startDate = now;
    
    // 计算结束日期
    if (subscription.period === 'monthly') {
      subscription.endDate = new Date(now.setMonth(now.getMonth() + 1));
    } else if (subscription.period === 'yearly') {
      subscription.endDate = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      subscription.endDate = null; // 永久
    }

    subscription.updatedAt = new Date();

    return subscription;
  }

  /**
   * 取消订阅
   */
  static async cancel(subscriptionId, userId) {
    const subscription = subscriptions.get(subscriptionId);
    
    if (!subscription) {
      const error = new Error('订阅不存在');
      error.status = 404;
      throw error;
    }

    if (subscription.userId !== userId) {
      const error = new Error('无权操作此订阅');
      error.status = 403;
      throw error;
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    subscription.updatedAt = new Date();

    return subscription;
  }

  /**
   * 获取用户订阅
   */
  static async getByUserId(userId) {
    const userSubscriptions = Array.from(subscriptions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);

    return userSubscriptions;
  }

  /**
   * 获取活跃订阅
   */
  static async getActiveSubscription(userId) {
    const userSubscriptions = await this.getByUserId(userId);
    const now = new Date();

    return userSubscriptions.find(s => 
      s.status === 'active' && 
      (!s.endDate || new Date(s.endDate) > now)
    );
  }

  /**
   * 检查用户权限
   */
  static async checkPermission(userId, feature) {
    const subscription = await this.getActiveSubscription(userId);
    const plan = subscription ? PLANS[subscription.planId.toUpperCase()] : PLANS.FREE;

    return {
      allowed: plan.features[feature] || false,
      plan: plan.id,
      planName: plan.name
    };
  }

  /**
   * 获取会员计划列表
   */
  static async getPlans() {
    return Object.values(PLANS).map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      period: plan.period,
      features: plan.features,
      popular: plan.id === 'standard'
    }));
  }
}

module.exports = {
  SubscriptionModel,
  PLANS
};
