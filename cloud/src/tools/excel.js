/**
 * Excel 分析工具
 * 使用 xlsx 库解析 Excel 文件
 */

const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class ExcelTool {
  /**
   * 解析 Excel 文件
   */
  static async parse(filePath) {
    try {
      // 读取文件
      const buffer = await fs.readFile(filePath);
      
      // 解析工作簿
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // 获取所有工作表
      const sheets = workbook.SheetNames;
      
      // 解析每个工作表
      const data = {};
      for (const sheetName of sheets) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        data[sheetName] = {
          headers: jsonData[0] || [],
          rows: jsonData.slice(1),
          rowCount: jsonData.length - 1,
          columnCount: jsonData[0]?.length || 0
        };
      }

      logger.info('Excel 解析成功', {
        sheets: sheets.length,
        totalRows: Object.values(data).reduce((sum, s) => sum + s.rowCount, 0)
      });

      return {
        success: true,
        data: {
          sheets,
          data,
          summary: this.generateSummary(data)
        }
      };
    } catch (error) {
      logger.error('Excel 解析失败', error);
      throw new Error(`Excel 解析失败：${error.message}`);
    }
  }

  /**
   * 生成数据摘要
   */
  static generateSummary(data) {
    const summary = {
      totalSheets: Object.keys(data).length,
      totalRows: 0,
      totalColumns: 0,
      numericColumns: [],
      dateColumns: [],
      textColumns: []
    };

    // 分析第一个工作表
    const firstSheet = data[Object.keys(data)[0]];
    if (!firstSheet) return summary;

    summary.totalRows = firstSheet.rowCount;
    summary.totalColumns = firstSheet.columnCount;

    // 分析列类型
    const headers = firstSheet.headers;
    const rows = firstSheet.rows;

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const values = rows.map(row => row[i]);
      
      // 判断列类型
      const type = this.detectColumnType(values);
      
      if (type === 'numeric') {
        summary.numericColumns.push({
          name: header,
          index: i,
          min: Math.min(...values.filter(v => typeof v === 'number')),
          max: Math.max(...values.filter(v => typeof v === 'number')),
          avg: values.filter(v => typeof v === 'number').reduce((a, b) => a + b, 0) / values.filter(v => typeof v === 'number').length
        });
      } else if (type === 'date') {
        summary.dateColumns.push({ name: header, index: i });
      } else {
        summary.textColumns.push({ name: header, index: i });
      }
    }

    return summary;
  }

  /**
   * 检测列类型
   */
  static detectColumnType(values) {
    const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonEmptyValues.length === 0) return 'empty';

    // 检查是否都是数字
    const allNumeric = nonEmptyValues.every(v => typeof v === 'number');
    if (allNumeric) return 'numeric';

    // 检查是否都是日期
    const allDate = nonEmptyValues.every(v => v instanceof Date || (typeof v === 'string' && !isNaN(Date.parse(v))));
    if (allDate) return 'date';

    return 'text';
  }

  /**
   * 数据分析
   */
  static async analyze(filePath, requirements) {
    const parseResult = await this.parse(filePath);
    const data = parseResult.data;

    // 提取第一个工作表的数据
    const firstSheet = data.data[Object.keys(data.data)[0]];
    if (!firstSheet) {
      throw new Error('工作表为空');
    }

    const headers = firstSheet.headers;
    const rows = firstSheet.rows;

    // 生成分析结果
    const analysis = {
      // 基础统计
      overview: {
        totalRecords: rows.length,
        columns: headers.length,
        columnNames: headers
      },

      // 数值列分析
      numericAnalysis: parseResult.summary.numericColumns.map(col => ({
        column: col.name,
        min: col.min,
        max: col.max,
        average: col.avg.toFixed(2),
        sum: (rows.reduce((sum, row) => sum + (row[col.index] || 0), 0)).toFixed(2)
      })),

      // 趋势分析 (如果有日期列)
      trendAnalysis: parseResult.summary.dateColumns.length > 0 ? 
        this.analyzeTrend(rows, parseResult.summary.dateColumns[0].index, parseResult.summary.numericColumns[0]?.index) : null,

      // 异常检测
      anomalies: this.detectAnomalies(rows, parseResult.summary.numericColumns),

      // 建议
      insights: this.generateInsights(parseResult.summary, requirements)
    };

    return {
      success: true,
      data: analysis
    };
  }

  /**
   * 趋势分析
   */
  static analyzeTrend(rows, dateIndex, valueIndex) {
    if (!dateIndex || !valueIndex) return null;

    const trendData = rows
      .map(row => ({
        date: row[dateIndex],
        value: row[valueIndex]
      }))
      .filter(d => d.date && d.value)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // 计算增长率
    if (trendData.length < 2) return null;

    const firstValue = trendData[0].value;
    const lastValue = trendData[trendData.length - 1].value;
    const growthRate = ((lastValue - firstValue) / firstValue * 100).toFixed(2);

    return {
      dataPoints: trendData.length,
      startDate: trendData[0].date,
      endDate: trendData[trendData.length - 1].date,
      startValue: firstValue,
      endValue: lastValue,
      growthRate: `${growthRate}%`,
      trend: growthRate > 0 ? '上升' : growthRate < 0 ? '下降' : '平稳'
    };
  }

  /**
   * 异常检测
   */
  static detectAnomalies(rows, numericColumns) {
    const anomalies = [];

    for (const col of numericColumns) {
      const values = rows.map(row => row[col.index]).filter(v => typeof v === 'number');
      
      if (values.length < 3) continue;

      // 计算标准差
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // 检测异常值 (超过 2 个标准差)
      const threshold = 2 * stdDev;
      const outliers = values.filter(v => Math.abs(v - mean) > threshold);

      if (outliers.length > 0) {
        anomalies.push({
          column: col.name,
          type: 'outlier',
          count: outliers.length,
          values: outliers.slice(0, 5), // 只显示前 5 个
          description: `发现 ${outliers.length} 个异常值，偏离平均值超过 2 个标准差`
        });
      }
    }

    return anomalies;
  }

  /**
   * 生成洞察建议
   */
  static generateInsights(summary, requirements) {
    const insights = [];

    // 数据量洞察
    if (summary.totalRows > 1000) {
      insights.push({
        type: 'info',
        title: '数据量充足',
        description: `共有 ${summary.totalRows} 条记录，适合进行统计分析`
      });
    }

    // 数值列洞察
    if (summary.numericColumns.length > 0) {
      insights.push({
        type: 'analysis',
        title: '可进行数值分析',
        description: `发现 ${summary.numericColumns.length} 个数值列，可进行求和、平均、趋势等分析`
      });
    }

    // 日期列洞察
    if (summary.dateColumns.length > 0) {
      insights.push({
        type: 'analysis',
        title: '可进行时间序列分析',
        description: `发现 ${summary.dateColumns.length} 个日期列，可进行趋势分析、同比环比等`
      });
    }

    // 根据用户需求生成建议
    if (requirements?.includes('销售')) {
      insights.push({
        type: 'suggestion',
        title: '销售分析建议',
        description: '建议关注：销售额趋势、产品销量排名、区域销售对比、季节性波动'
      });
    }

    return insights;
  }
}

module.exports = ExcelTool;
