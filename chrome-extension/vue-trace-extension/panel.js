console.log('Panel script loading...');

// 记录日志以确认脚本加载
console.log("Panel script loaded");

document.addEventListener('DOMContentLoaded', function() {
  console.log("Panel DOM loaded");
  injectContentScript();
});

// 监听来自页面的消息
let port = chrome.runtime.connect({name: "vue-trace-panel"});

port.onMessage.addListener(function(msg) {
  console.log("Panel received message:", msg);
});

// 渲染函数调用树
function renderTraceTree(node, depth = 0) {
  console.log('Rendering node:', node);
  if (!node) {
    console.log('Empty node, returning empty string');
    return '';
  }
  
  const indent = '  '.repeat(depth);
  const args = node.args ? JSON.stringify(node.args) : '[]';
  const duration = node.duration ? `${node.duration.toFixed(2)}ms` : '';
  const location = node.location || '';
  const name = node.name || 'anonymous';
  
  console.log(`Rendering node: ${name} with ${node.children?.length || 0} children`);
  
  return `
    <div class="tree-node">
      <div class="node-content" data-location="${location}">
        ${indent}${name} 
        <span class="args">${args}</span>
        <span class="time">${duration}</span>
      </div>
      ${node.children?.length ? 
        `<div class="children">
          ${node.children.map(child => renderTraceTree(child, depth + 1)).join('')}
        </div>` 
        : ''
      }
    </div>
  `.trim();
}

// 注入内容脚本来获取跟踪数据
function injectContentScript() {
  console.log("Injecting content script...");
  try {
    chrome.devtools.inspectedWindow.eval(
      `
      (function() {
        try {
          const trace = window.__VUE_TRACE__;
          if (!trace) {
            console.log("No trace object found");
            return { error: "No trace object found" };
          }
          
          // 获取当前调用树的根节点
          let root = trace.currentNode;
          if (!root) {
            console.log("No current node");
            return { error: "No active function calls" };
          }
          
          // 向上查找根节点
          while (root.parent) {
            root = root.parent;
          }
          
          // 序列化节点数据
          function serializeNode(node) {
            return {
              name: node.name,
              args: node.args,
              location: node.location,
              duration: node.duration,
              children: node.children ? node.children.map(serializeNode) : []
            };
          }
          
          // 返回序列化后的数据
          return { data: serializeNode(root) };
        } catch (e) {
          console.error("Error in eval:");
          return { error: e.message };
        }
      })();
      `,
      function(result, isException) {
        console.log("Eval callback - Result:", result, "Exception:", isException);
        
        if (!isException && result) {
          if (result.error) {
            console.log("Error from eval:", result.error);
            return;
          }
          
          const container = document.getElementById('tree-container');
          if (container) {
            console.log("Starting tree render with data:", result.data);
            const html = renderTraceTree(result.data);
            console.log("Generated HTML:", html);
            container.innerHTML = html;
            console.log("Tree rendered");
            
            // 添加点击事件处理
            document.querySelectorAll('.node-content').forEach(node => {
              node.addEventListener('click', () => {
                const location = node.dataset.location;
                if (location) {
                  const [file, line, column] = location.split(':');
                  chrome.devtools.panels.openResource(file, parseInt(line), function(result) {
                    console.log('Opened file:', file, 'Result:', result);
                  });
                }
              });
            });
          } else {
            console.error("Container not found");
          }
        } else {
          console.error("Eval failed:", isException);
        }
      }
    );
  } catch (e) {
    console.error("Error in injectContentScript:", e);
  }
}

// 定期刷新树
setInterval(injectContentScript, 1000);

// 添加刷新按钮
const refreshButton = document.createElement('button');
refreshButton.textContent = 'Refresh';
refreshButton.style.position = 'fixed';
refreshButton.style.top = '10px';
refreshButton.style.right = '10px';
refreshButton.addEventListener('click', injectContentScript);
document.body.appendChild(refreshButton); 