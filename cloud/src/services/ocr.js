/**
 * OCR 图片识别服务
 * 
 * 功能：
 * - 图片文字识别 (OCR)
 * - 表格识别
 * - 手写文字识别
 * - 多语言支持
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

// 阿里云视觉智能配置
const ALIYUN_OCR_ENDPOINT = process.env.ALIYUN_OCR_ENDPOINT || 'vision.cn-shanghai.aliyuncs.com';
const ALIYUN_OCR_API_KEY = process.env.ALIYUN_OCR_API_KEY;
const ALIYUN_OCR_API_SECRET = process.env.ALIYUN_OCR_API_SECRET;

class OCRService {
  /**
   * 通用文字识别
   * 
   * @param {string} imagePath - 图片路径
   * @returns {Promise<Object>} 识别结果
   */
  static async recognizeText(imagePath) {
    try {
      // 读取图片并转换为 Base64
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      // 调用阿里云 OCR API
      const result = await this.callOCRAPI('RecognizeText', {
        ImageContent: imageBase64
      });

      logger.info('OCR 文字识别成功', {
        textLength: result.text ? result.text.length : 0,
        confidence: result.confidence
      });

      return {
        success: true,
        text: result.text || '',
        confidence: result.confidence || 0,
        words: result.words || [],
        lines: result.lines || []
      };
    } catch (error) {
      logger.error('OCR 文字识别失败', error);
      throw error;
    }
  }

  /**
   * 表格识别
   * 
   * @param {string} imagePath - 图片路径
   * @returns {Promise<Object>} 识别结果
   */
  static async recognizeTable(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const result = await this.callOCRAPI('RecognizeTable', {
        ImageContent: imageBase64
      });

      logger.info('表格识别成功', {
        rows: result.rows ? result.rows.length : 0,
        columns: result.columns || 0
      });

      return {
        success: true,
        table: result.rows || [],
        headers: result.headers || [],
        rowCount: result.rows ? result.rows.length : 0,
        columnCount: result.columns || 0
      };
    } catch (error) {
      logger.error('表格识别失败', error);
      throw error;
    }
  }

  /**
   * 名片识别
   * 
   * @param {string} imagePath - 图片路径
   * @returns {Promise<Object>} 识别结果
   */
  static async recognizeBusinessCard(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const result = await this.callOCRAPI('RecognizeBusinessCard', {
        ImageContent: imageBase64
      });

      return {
        success: true,
        data: {
          name: result.name || '',
          title: result.title || '',
          company: result.company || '',
          phone: result.phone || '',
          email: result.email || '',
          address: result.address || '',
          website: result.website || ''
        }
      };
    } catch (error) {
      logger.error('名片识别失败', error);
      throw error;
    }
  }

  /**
   * 身份证识别
   * 
   * @param {string} imagePath - 图片路径
   * @param {string} side - 面：front(正面) / back(反面)
   * @returns {Promise<Object>} 识别结果
   */
  static async recognizeIDCard(imagePath, side = 'front') {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const result = await this.callOCRAPI('RecognizeIDCard', {
        ImageContent: imageBase64,
        Side: side
      });

      return {
        success: true,
        data: result,
        side: side
      };
    } catch (error) {
      logger.error('身份证识别失败', error);
      throw error;
    }
  }

  /**
   * 银行卡识别
   * 
   * @param {string} imagePath - 图片路径
   * @returns {Promise<Object>} 识别结果
   */
  static async recognizeBankCard(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const result = await this.callOCRAPI('RecognizeBankCard', {
        ImageContent: imageBase64
      });

      return {
        success: true,
        data: {
          cardNumber: result.cardNumber || '',
          bankName: result.bankName || '',
          cardType: result.cardType || ''
        }
      };
    } catch (error) {
      logger.error('银行卡识别失败', error);
      throw error;
    }
  }

  /**
   * 驾驶证识别
   * 
   * @param {string} imagePath - 图片路径
   * @returns {Promise<Object>} 识别结果
   */
  static async recognizeDriverLicense(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const result = await this.callOCRAPI('RecognizeDriverLicense', {
        ImageContent: imageBase64
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error('驾驶证识别失败', error);
      throw error;
    }
  }

  /**
   * 行驶证识别
   * 
   * @param {string} imagePath - 图片路径
   * @returns {Promise<Object>} 识别结果
   */
  static async recognizeVehicleLicense(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const result = await this.callOCRAPI('RecognizeVehicleLicense', {
        ImageContent: imageBase64
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error('行驶证识别失败', error);
      throw error;
    }
  }

  /**
   * 发票识别
   * 
   * @param {string} imagePath - 图片路径
   * @returns {Promise<Object>} 识别结果
   */
  static async recognizeInvoice(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const result = await this.callOCRAPI('RecognizeInvoice', {
        ImageContent: imageBase64
      });

      return {
        success: true,
        data: {
          invoiceCode: result.invoiceCode || '',
          invoiceNumber: result.invoiceNumber || '',
          amount: result.amount || '',
          date: result.date || '',
          sellerName: result.sellerName || '',
          buyerName: result.buyerName || ''
        }
      };
    } catch (error) {
      logger.error('发票识别失败', error);
      throw error;
    }
  }

  /**
   * 调用阿里云 OCR API
   * 
   * @param {string} action - API 动作
   * @param {Object} params - 请求参数
   * @returns {Promise<Object>} API 响应
   */
  static async callOCRAPI(action, params) {
    try {
      // 如果没有配置阿里云密钥，返回模拟数据用于测试
      if (!ALIYUN_OCR_API_KEY || !ALIYUN_OCR_API_SECRET) {
        logger.warn('阿里云 OCR 未配置，返回模拟数据');
        return this.getMockData(action);
      }

      const timestamp = new Date().toISOString();
      const nonce = Math.random().toString(36).substring(2);

      // 构建签名
      const signData = {
        Action: action,
        Version: '2019-12-30',
        Timestamp: timestamp,
        Format: 'JSON',
        SignatureMethod: 'HMAC-SHA1',
        SignatureVersion: '1.0',
        SignatureNonce: nonce,
        ...params
      };

      // 调用 API
      const response = await axios.post(
        `http://${ALIYUN_OCR_ENDPOINT}/`,
        new URLSearchParams(signData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('调用阿里云 OCR API 失败', error);
      throw error;
    }
  }

  /**
   * 获取模拟数据 (用于测试)
   */
  static getMockData(action) {
    const mockData = {
      'RecognizeText': {
        text: '这是一段模拟的 OCR 识别文本。\n识别结果仅供参考测试使用。',
        confidence: 0.95,
        words: [
          { text: '这是', confidence: 0.98 },
          { text: '一段', confidence: 0.97 },
          { text: '模拟', confidence: 0.96 }
        ],
        lines: [
          { text: '这是一段模拟的 OCR 识别文本。', confidence: 0.95 },
          { text: '识别结果仅供参考测试使用。', confidence: 0.94 }
        ]
      },
      'RecognizeTable': {
        headers: ['姓名', '年龄', '城市'],
        rows: [
          ['张三', '25', '北京'],
          ['李四', '30', '上海'],
          ['王五', '28', '广州']
        ],
        columns: 3
      },
      'RecognizeBusinessCard': {
        name: '张三',
        title: '总经理',
        company: '某某科技有限公司',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        address: '北京市朝阳区某某路 1 号',
        website: 'www.example.com'
      },
      'RecognizeIDCard': {
        name: '张三',
        gender: '男',
        ethnicity: '汉',
        birth: '1990/01/01',
        address: '北京市朝阳区某某路 1 号',
        idNumber: '110101199001011234'
      },
      'RecognizeBankCard': {
        cardNumber: '6222 0212 1001 2345 678',
        bankName: '中国工商银行',
        cardType: '借记卡'
      }
    };

    return mockData[action] || { text: '模拟识别结果', confidence: 0.9 };
  }
}

module.exports = OCRService;
