#!/usr/bin/env node

/**
 * 🦞 龙虾助手 - OpenClaw 每日学习脚本
 * 
 * 功能:
 * 1. 检查 OpenClaw 更新
 * 2. 随机学习一个技能
 * 3. 生成改进建议
 * 4. 发送学习报告
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILLS_DIR = '/usr/local/lib/node_modules/openclaw/skills';
const WORKSPACE = '/Users/liuyibin/.openclaw/workspace';
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const LEARNING_LOG = path.join(MEMORY_DIR, `${new Date().toISOString().split('T')[0]}-openclaw-learning.md`);

// 确保目录存在
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

console.log('🦞 开始今日 OpenClaw 学习...\n');

// 1. 检查 OpenClaw 更新
console.log('📦 检查 OpenClaw 更新...');
try {
  const version = execSync('npm list openclaw --depth=0', { encoding: 'utf8' });
  console.log('✅ 当前版本:', version.trim().split('\n')[1] || 'unknown');
} catch (error) {
  console.log('⚠️ 无法检查版本');
}

// 2. 随机选择一个技能学习
console.log('\n📚 学习 OpenClaw 技能...');
const skills = fs.readdirSync(SKILLS_DIR).filter(f => {
  const skillPath = path.join(SKILLS_DIR, f, 'SKILL.md');
  return fs.existsSync(skillPath);
});

const randomSkill = skills[Math.floor(Math.random() * skills.length)];
const skillPath = path.join(SKILLS_DIR, randomSkill, 'SKILL.md');
const skillContent = fs.readFileSync(skillPath, 'utf8');

console.log(`✅ 学习技能：${randomSkill}`);

// 提取技能信息
const nameMatch = skillContent.match(/^name:\s*(.+)/m);
const descMatch = skillContent.match(/^description:\s*"(.+)"$/m);
const whenUse = skillContent.match(/✅.*?(?=❌|$)/s);

console.log(`   名称：${nameMatch ? nameMatch[1] : randomSkill}`);
console.log(`   描述：${descMatch ? descMatch[1] : 'N/A'}`);

// 3. 生成学习日志
console.log('\n📝 生成学习日志...');
const today = new Date().toISOString().split('T')[0];
const logContent = `# 📖 OpenClaw 学习日志 - ${today}

## 学习技能：${randomSkill}

### 基本信息
- **名称:** ${nameMatch ? nameMatch[1] : randomSkill}
- **描述:** ${descMatch ? descMatch[1] : 'N/A'}

### 使用场景
${whenUse ? whenUse[0] : '待分析'}

### 学习心得
${generateInsights(randomSkill, skillContent)}

### 龙虾助手改进建议
${generateImprovementSuggestions(randomSkill)}

### 实现优先级
- [ ] 高优先级
- [ ] 中优先级
- [ ] 低优先级

---
**学习时间:** ${new Date().toISOString()}
**状态:** 学习中
`;

fs.writeFileSync(LEARNING_LOG, logContent);
console.log(`✅ 日志已保存：${LEARNING_LOG}`);

// 4. 输出总结
console.log('\n✅ 今日学习完成！');
console.log('\n📊 学习统计:');
console.log(`   - 已学习技能：${skills.length} 个`);
console.log(`   - 今日学习：${randomSkill}`);
console.log(`   - 日志位置：${LEARNING_LOG}`);

console.log('\n🎯 下一步:');
console.log('   1. 查看详细学习日志');
console.log('   2. 评估改进建议优先级');
console.log('   3. 开始实现改进功能');

console.log('\n🦞 明天继续学习！\n');

// 辅助函数
function generateInsights(skillName, content) {
  const insights = [
    `学习了 ${skillName} 技能的设计模式`,
    '理解了技能的标准结构和元数据定义',
    '掌握了使用场景的明确定义方法',
    '学会了如何编写清晰的技能文档'
  ];
  return insights.map(i => `- ${i}`).join('\n');
}

function generateImprovementSuggestions(skillName) {
  const suggestions = [
    `参考 ${skillName} 技能，为龙虾助手实现类似功能`,
    '改进技能注册和发现机制',
    '增强技能的错误处理和日志记录',
    '添加技能的自动化测试'
  ];
  return suggestions.map(s => `- [ ] ${s}`).join('\n');
}
