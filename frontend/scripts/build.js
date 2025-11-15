const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building frontend for production...');

try {
  // Сборка проекта
  execSync('node node_modules/webpack/bin/webpack.js --mode production', { stdio: 'inherit' });
  
  // Копирование манифеста TON Connect
  const manifestSource = path.join(__dirname, '../public/tonconnect-manifest.json');
  const manifestDest = path.join(__dirname, '../dist/tonconnect-manifest.json');
  
  if (fs.existsSync(manifestSource)) {
    fs.copyFileSync(manifestSource, manifestDest);
    console.log('✅ TON Connect manifest copied');
  }
  
  // Проверка сборки
  const distExists = fs.existsSync(path.join(__dirname, '../dist'));
  const indexExists = fs.existsSync(path.join(__dirname, '../dist/index.html'));
  
  if (distExists && indexExists) {
    console.log('✅ Build completed successfully!');
    console.log('📁 Output directory: dist/');
  } else {
    throw new Error('Build failed - dist directory not properly created');
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}