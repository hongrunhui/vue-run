const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// 获取当前目录
const currentDir = __dirname;

// 检查所有必需的文件
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

// 检查文件是否存在并输出详细信息
files.forEach(file => {
  const filePath = path.join(currentDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${file}`);
    console.error(`Tried to find at: ${filePath}`);
  } else {
    console.log(`Found file: ${file} at ${filePath}`);
  }
});

// 检查是否有缺失文件
const missingFiles = files.filter(file => !fs.existsSync(path.join(currentDir, file)));
if (missingFiles.length > 0) {
  console.error('Error: Missing files:', missingFiles);
  process.exit(1);
}

const output = fs.createWriteStream(path.join(currentDir, 'vue-trace-extension.zip'));
const archive = archiver('zip');

output.on('close', () => {
  console.log('Extension has been packaged successfully');
});

archive.on('error', (err) => {
  console.error('Error during packaging:', err);
  process.exit(1);
});

archive.pipe(output);

// 添加所有文件
files.forEach(file => {
  const filePath = path.join(currentDir, file);
  archive.file(filePath, { name: file });
  console.log(`Added ${file} to package from ${filePath}`);
});

archive.finalize(); 