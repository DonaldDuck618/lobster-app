/**
 * Excel 分析服务
 * 
 * 功能：
 * - 解析 Excel 文件
 * - 数据统计分析
 * - 生成洞察报告
 * - 数据可视化建议
 */

const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class ExcelAnalysisService {
  /**
   * 解析 Excel 文件
   * 
   * @param {string} filePath - 文件路径
   * @returns {Promise<Object>} 解析结果
   */
  static async parseExcel(filePath) {
    try {
      // 读取文件
      const workbook = XLSX.readFile(filePath);
      
      // 获取所有工作表
      const sheets = workbook.SheetNames;
      const result = {
        sheets: [],
        totalRows: 0,
        totalColumns: 0
      };
      
      // 解析每个工作表
      for (const sheetName of sheets) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          
          result.sheets.push({
            name: sheetName,
            headers: headers,
            rows: rows,
            rowCount: rows.length,
            columnCount: headers.length
          });
          
          result.totalRows += rows.length;
          result.totalColumns = Math.max(result.totalColumns, headers.length);
        }
      }
      
      logger.info('Excel 文件解析成功', { 
        sheets: sheets.length, 
        totalRows: result.totalRows 
      });
      
      return result;
    } catch (error) {
      logger.error('Excel 文件解析失败', error);
      throw error;
    }
  }

  /**
   * 数据统计分析
   * 
   * @param {Array} data - 数据数组
   * @param {Array} headers - 表头
   * @returns {Promise<Object>} 分析结果
   */
  static async analyzeData(data, headers) {
    try {
      const analysis = {
        overview: {},
        numericColumns: [],
        categoricalColumns: [],
        insights: []
      };
      
      // 识别列类型
      const columnTypes = this.identifyColumnTypes(data, headers);
      
      // 数值列分析
      for (const col of columnTypes.numeric) {
        const values = data.map(row => parseFloat(row[col]) || 0);
        analysis.numericColumns.push({
          name: headers[col],
          index: col,
          sum: values.reduce((a, b) => a + b, 0),
          average: values.reduce((a, b) => a + b, 0) / values.length,
          max: Math.max(...values),
          min: Math.min(...values),
          count: values.length
        });
      }
      
      // 分类列分析
      for (const col of columnTypes.categorical) {
        const values = data.map(row => row[col]);
        const frequency = {};
        values.forEach(v => {
          frequency[v] = (frequency[v] || 0) + 1;
        });
        
        const sorted = Object.entries(frequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);
        
        analysis.categoricalColumns.push({
          name: headers[col],
          index: col,
          uniqueCount: Object.keys(frequency).length,
          topValues: sorted.map(([value, count]) => ({ value, count }))
        });
      }
      
      // 生成洞察
      analysis.insights = this.generateInsights(analysis);
      
      // 总体概览
      analysis.overview = {
        totalRows: data.length,
        totalColumns: headers.length,
        numericColumnCount: columnTypes.numeric.length,
        categoricalColumnCount: columnTypes.categorical.length
      };
      
      return analysis;
    } catch (error) {
      logger.error('数据分析失败', error);
      throw error;
    }
  }

  /**
   * 识别列类型
   */
  static identifyColumnTypes(data, headers) {
    const columnTypes = {
      numeric: [],
      categorical: []
    };
    
    headers.forEach((header, index) => {
      // 采样前 10 行判断列类型
      const sample = data.slice(0, 10).map(row => row[index]);
      const numericCount = sample.filter(v => !isNaN(parseFloat(v))).length;
      
      if (numericCount > sample.length * 0.8) {
        columnTypes.numeric.push(index);
      } else {
        columnTypes.categorical.push(index);
      }
    });
    
    return columnTypes;
  }

  /**
   * 生成洞察报告
   */
  static generateInsights(analysis) {
    const insights = [];
    
    // 数值列洞察
    for (const col of analysis.numericColumns) {
      const range = col.max - col.min;
      const coefficient = col.average > 0 ? (range / col.average) : 0;
      
      if (coefficient > 2) {
        insights.push({
          type: 'warning',
          title: `${col.name} 波动较大`,
          description: `最大值 ${col.max}，最小值 ${col.min}，差异 ${range.toFixed(2)}`
        });
      }
      
      insights.push({
        type: 'info',
        title: `${col.name} 统计`,
        description: `总计：${col.sum.toFixed(2)}，平均：${col.average.toFixed(2)}`
      });
    }
    
    // 分类列洞察
    for (const col of analysis.categoricalColumns) {
      if (col.topValues.length > 0) {
        const top = col.topValues[0];
        const percentage = ((top.count / col.uniqueCount) * 100).toFixed(1);
        
        insights.push({
          type: 'info',
          title: `${col.name} 分布`,
          description: `最常见：${top.value} (${top.count}次，占${percentage}%)`
        });
      }
    }
    
    return insights;
  }

  /**
   * 生成分析报告
   */
  static generateReport(analysis, fileName) {
    const report = {
      fileName: fileName,
      generatedAt: new Date().toISOString(),
      overview: analysis.overview,
      numericAnalysis: analysis.numericColumns,
      categoricalAnalysis: analysis.categoricalColumns,
      insights: analysis.insights,
      recommendations: this.generateRecommendations(analysis)
    };
    
    return report;
  }

  /**
   * 生成建议
   */
  static generateRecommendations(analysis) {
    const recommendations = [];
    
    // 基于数值分析的建议
    for (const col of analysis.numericColumns) {
      if (col.average < (col.max * 0.3)) {
        recommendations.push({
          type: 'optimization',
          title: `提升${col.name}`,
          description: `当前平均值 ${col.average.toFixed(2)}，有提升空间`
        });
      }
    }
    
    // 基于分类分析的建议
    for (const col of analysis.categoricalColumns) {
      if (col.topValues.length > 0 && col.topValues[0].count > (col.uniqueCount * 0.5)) {
        recommendations.push({
          type: 'focus',
          title: `关注${col.name}`,
          description: `${col.topValues[0].value} 占比最高，建议重点关注`
        });
      }
    }
    
    return recommendations;
  }
}

module.exports = ExcelAnalysisService;
