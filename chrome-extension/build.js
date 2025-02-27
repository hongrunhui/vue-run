const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// 源文件目录和目标目录
const sourceDir = __dirname;
const targetDir = path.join(sourceDir, 'vue-trace-extension');

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 需要复制的文件列表
const files = [
  'manifest.json',
  'devtools.html',
  'devtools.js',
  'panel.html',
  'panel.js',
  'content.js',
  'background.js',
  'icon16.png'
];

// 首先复制所有文件到目标目录
files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${file} to ${targetPath}`);
  } else {
    console.error(`Source file not found: ${sourcePath}`);
    process.exit(1);
  }
});

// 创建 zip 文件
const output = fs.createWriteStream(path.join(sourceDir, 'vue-trace-extension.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', () => {
  console.log('Extension has been packaged successfully');
  // 清理目标目录
  files.forEach(file => {
    const targetPath = path.join(targetDir, file);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  });
  if (fs.existsSync(targetDir)) {
    fs.rmdirSync(targetDir);
  }
  console.log('Cleanup completed');
});

archive.on('error', (err) => {
  console.error('Error during packaging:', err);
  process.exit(1);
});

archive.pipe(output);

// 从目标目录添加文件到 zip
files.forEach(file => {
  const targetPath = path.join(targetDir, file);
  archive.file(targetPath, { name: file });
  console.log(`Added ${file} to package`);
});

archive.finalize(); 