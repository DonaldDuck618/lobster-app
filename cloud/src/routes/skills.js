/**
 * 技能系统路由
 */

const express = require('express');
const router = express.Router();
const { skillSystem } = require('../services/skill-system');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

// 所有接口需要认证
router.use(authMiddleware);

/**
 * GET /api/v1/skills
 * 获取所有技能列表
 */
router.get('/', async (req, res) => {
  try {
    const skills = skillSystem.getAllSkills();
    
    res.json({
      success: true,
      data: {
        skills: skills,
        total: skills.length
      }
    });
  } catch (error) {
    logger.error('获取技能列表失败', error);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * GET /api/v1/skills/:skillName
 * 获取技能详情
 */
router.get('/:skillName', async (req, res) => {
  try {
    const { skillName } = req.params;
    const skill = skillSystem.getSkill(skillName);
    
    if (!skill) {
      return res.status(404).json({
        error: '技能不存在'
      });
    }
    
    res.json({
      success: true,
      data: {
        name: skill.name,
        description: skill.description,
        definition: skill.getDefinition()
      }
    });
  } catch (error) {
    logger.error('获取技能详情失败', error);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * POST /api/v1/skills/:skillName/execute
 * 执行技能
 */
router.post('/:skillName/execute', async (req, res) => {
  try {
    const { skillName } = req.params;
    const params = req.body;
    
    const result = await skillSystem.executeSkill(skillName, params);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('执行技能失败', error);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
