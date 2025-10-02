const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(__dirname, 'node_modules');
const lockFile = path.join(__dirname, 'package-lock.json');
const yarnLockFile = path.join(__dirname, 'yarn.lock');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', shell: true });
}

console.log('🧹 Limpando node_modules e locks...');

if (fs.existsSync(nodeModulesPath)) {
  if (process.platform === 'win32') {
    run(`rmdir /s /q "${nodeModulesPath}"`);
  } else {
    run(`rm -rf "${nodeModulesPath}"`);
  }
}

if (fs.existsSync(lockFile)) {
  fs.unlinkSync(lockFile);
}

if (fs.existsSync(yarnLockFile)) {
  fs.unlinkSync(yarnLockFile);
}

console.log('📦 Instalando dependências...');
if (fs.existsSync(path.join(__dirname, 'yarn.lock'))) {
  run('yarn install');
} else {
  run('npm install');
}

console.log('✅ Ambiente limpo e dependências reinstaladas!');
