/**
 * 初始化技能系统
 * 批量加载所有 OpenClaw 技能
 */

const { skillSystem } = require('../services/skill-system');
const logger = require('../utils/logger');

async function initSkills() {
  try {
    logger.info('开始初始化技能系统...');
    
    await skillSystem.initialize();
    
    const skills = skillSystem.listSkills();
    
    console.log('\n✅ 技能系统初始化完成！');
    console.log(`📊 已加载技能：${skills.length} 个`);
    console.log('\n技能列表:');
    skills.forEach((skill, index) => {
      console.log(`  ${index + 1}. ${skill}`);
    });
    
    return skills;
  } catch (error) {
    console.error('❌ 技能系统初始化失败:', error);
    throw error;
  }
}

// 如果直接运行
if (require.main === module) {
  initSkills().catch(console.error);
}

module.exports = initSkills;
