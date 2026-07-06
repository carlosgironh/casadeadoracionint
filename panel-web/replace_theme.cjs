const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Backgrounds
  content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-gray-50');
  content = content.replace(/bg-\[#141414\]/g, 'bg-white');
  content = content.replace(/bg-\[#2a2a2a\]/g, 'bg-gray-100');
  content = content.replace(/bg-amber-500/g, 'bg-[#0D509E]');
  content = content.replace(/hover:bg-amber-600/g, 'hover:bg-[#0b3c75]');
  
  // Borders
  content = content.replace(/border-\[#2a2a2a\]/g, 'border-gray-200');
  
  // Text
  content = content.replace(/text-white/g, 'text-gray-900');
  content = content.replace(/text-gray-400/g, 'text-gray-500');
  content = content.replace(/text-\[#C9A227\]/g, 'text-[#0D509E]');
  content = content.replace(/text-amber-500/g, 'text-[#0D509E]');
  
  // Specific tweaks
  content = content.replace(/hover:text-white/g, 'hover:text-gray-900');
  content = content.replace(/focus:ring-amber-500/g, 'focus:ring-[#5EBBEC]');
  content = content.replace(/focus:border-amber-500/g, 'focus:border-[#5EBBEC]');
  content = content.replace(/text-black bg-amber-500/g, 'text-white bg-[#0D509E]');

  fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  });
}

walkDir(path.join(__dirname, 'src'));
console.log('Reemplazo completado.');
