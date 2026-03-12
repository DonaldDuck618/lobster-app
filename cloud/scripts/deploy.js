#!/usr/bin/env node

/**
 * 龙虾 Gateway - 一键部署脚本
 * 部署到阿里云服务器
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 配置
const CONFIG = {
  server: process.env.DEPLOY_SERVER || 'your-server-ip',
  user: process.env.DEPLOY_USER || 'root',
  deployPath: '/opt/lobster-app',
  projectName: 'lobster-prod'
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 步骤 1: 检查配置
function checkConfig() {
  log('\n🦞 龙虾 Gateway - 一键部署', 'blue');
  log('================================', 'blue');
  
  if (!fs.existsSync('.env.production')) {
    log('❌ 错误：缺少 .env.production 文件', 'red');
    process.exit(1);
  }
  
  log('✅ 配置文件检查通过', 'green');
}

// 步骤 2: 安装依赖
function installDependencies() {
  log('\n📦 安装生产依赖...', 'blue');
  execSync('npm install --production', { stdio: 'inherit' });
  log('✅ 依赖安装完成', 'green');
}

// 步骤 3: 运行测试
function runTests() {
  log('\n🧪 运行测试...', 'blue');
  try {
    execSync('npm test', { stdio: 'inherit' });
    log('✅ 测试通过', 'green');
  } catch (error) {
    log('⚠️  测试失败，是否继续部署？(y/n)', 'yellow');
    const answer = require('readline-sync').question('> ');
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }
}

// 步骤 4: 打包文件
function packFiles() {
  log('\n📦 打包部署文件...', 'blue');
  
  const deployDir = path.join(__dirname, '../dist/deploy');
  
  // 创建部署目录
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }
  
  // 复制必要文件
  const filesToCopy = [
    'src',
    'package.json',
    'package-lock.json',
    '.env.production',
    'scripts'
  ];
  
  filesToCopy.forEach(file => {
    const src = path.join(__dirname, '..', file);
    const dest = path.join(deployDir, file);
    
    if (fs.existsSync(src)) {
      execSync(`cp -r ${src} ${dest}`);
      log(`  ✅ ${file}`, 'green');
    }
  });
  
  log('✅ 打包完成', 'green');
}

// 步骤 5: 上传到服务器
function uploadToServer() {
  log('\n🚀 上传到服务器...', 'blue');
  
  if (CONFIG.server === 'your-server-ip') {
    log('⚠️  未配置服务器地址，跳过上传', 'yellow');
    log('提示：设置 DEPLOY_SERVER 环境变量', 'yellow');
    return;
  }
  
  try {
    // 使用 scp 上传
    execSync(`scp -r dist/deploy/* ${CONFIG.user}@${CONFIG.server}:${CONFIG.deployPath}`, {
      stdio: 'inherit'
    });
    log('✅ 上传完成', 'green');
  } catch (error) {
    log('❌ 上传失败，请检查服务器配置', 'red');
    throw error;
  }
}

// 步骤 6: 远程部署
function remoteDeploy() {
  log('\n🔧 远程部署...', 'blue');
  
  if (CONFIG.server === 'your-server-ip') {
    return;
  }
  
  try {
    // SSH 执行远程命令
    const commands = [
      `cd ${CONFIG.deployPath}`,
      'npm install --production',
      'pm2 stop ' + CONFIG.projectName + ' || true',
      'pm2 delete ' + CONFIG.projectName + ' || true',
      'pm2 start src/index.js --name ' + CONFIG.projectName,
      'pm2 save'
    ];
    
    execSync(`ssh ${CONFIG.user}@${CONFIG.server} "${commands.join(' && ')}"`, {
      stdio: 'inherit'
    });
    
    log('✅ 远程部署完成', 'green');
  } catch (error) {
    log('❌ 远程部署失败', 'red');
    throw error;
  }
}

// 步骤 7: 健康检查
function healthCheck() {
  log('\n🏥 健康检查...', 'blue');
  
  try {
    const response = execSync('curl -s http://localhost:3000/health', {
      encoding: 'utf8'
    });
    
    const result = JSON.parse(response);
    
    if (result.status === 'ok') {
      log('✅ 服务运行正常', 'green');
      log(`   版本：${result.version}`, 'blue');
      log(`   时间：${result.timestamp}`, 'blue');
    } else {
      log('⚠️  服务状态异常', 'yellow');
    }
  } catch (error) {
    log('⚠️  无法访问服务，请手动检查', 'yellow');
  }
}

// 主流程
function main() {
  try {
    checkConfig();
    installDependencies();
    runTests();
    packFiles();
    uploadToServer();
    remoteDeploy();
    healthCheck();
    
    log('\n🎉 部署完成！', 'green');
    log('================================', 'green');
    log('生产环境：http://localhost:3000', 'blue');
    log('查看日志：pm2 logs ' + CONFIG.projectName, 'blue');
    log('重启服务：pm2 restart ' + CONFIG.projectName, 'blue');
    log('================================', 'green');
    
  } catch (error) {
    log('\n❌ 部署失败', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// 运行
main();
