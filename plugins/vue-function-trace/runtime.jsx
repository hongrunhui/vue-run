import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';

// 添加样式
const styles = `
  .tree-node {
    margin: 10px 0;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
  }
  .node-content {
    cursor: pointer;
    font-weight: bold;
  }
  .children {
    margin-left: 20px;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// TraceTree 组件
function TraceTree(props) {
  return (
    <div class="trace-tree">
      {props.nodes.map(node => (
        <div class="tree-node">
          <div class="node-content" onclick={() => jumpToCode(node.location)}>
            {node.name} 
            <span class="time">({node.endTime - node.startTime}ms)</span>
          </div>
          {node.children.length ? (
            <div class="children">
              <TraceTree nodes={node.children} /> {/* 递归调用 */}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// 初始化 UI
export function initTraceUI() {
  const button = document.createElement('button');
  button.innerText = '查看函数调用树';
  button.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 9999;
  `;
  
  button.onclick = () => {
    showTracePanel();
  };
  console.log('window.__VUE_TRACE__', window.__VUE_TRACE__.currentNode);
  document.body.appendChild(button);
}

// 显示函数调用面板
function showTracePanel() {
  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 60px;
    width: 600px;
    height: 80vh;
    background: white;
    border: 1px solid #ccc;
    padding: 20px;
    overflow: auto;
    z-index: 9999;
  `;

  // 创建 iframe
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  console.log('window.__VUE_TRACE__', window.__VUE_TRACE__);
  // 设置 iframe 的内容为 HTML 字符串
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>函数调用树</title>
      <style>
        .tree-node {
          margin: 10px 0;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        .node-content {
          cursor: pointer;
          font-weight: bold;
          display: flex;
          align-items: center;
        }
        .children {
          margin-left: 20px;
        }
        .toggle-icon {
          margin-left: 8px;
          font-size: 0.8em;
        }
      </style>
    </head>
    <body>
      <div id="tree-container"></div>
      <script>
        const rootNode = window.parent.__VUE_TRACE__.rootNode;
        console.log('rootNode', rootNode);
        const renderTraceTree = (nodes) => {
          if (!nodes || !nodes.length) return '';
          return nodes.map(node => {
            return \`
              <div class="tree-node">
                <div class="node-content" onclick="toggleChildren(this)">
                  \${node.name} 
                  <span class="time">(\${node.endTime - node.startTime}ms)</span>
                  <span class="toggle-icon">►</span>
                </div>
                <div class="children" style="display: none;">
                  \${renderTraceTree(node.children)}
                </div>
              </div>
            \`;
          }).join('');
        };

        const toggleChildren = (element) => {
          const childrenDiv = element.parentElement.querySelector('.children');
          const toggleIcon = element.querySelector('.toggle-icon');
          if (childrenDiv.style.display === 'none') {
            childrenDiv.style.display = 'block';
            toggleIcon.textContent = '▼'; // 展开图标
          } else {
            childrenDiv.style.display = 'none';
            toggleIcon.textContent = '►'; // 收起图标
          }
        };

        document.getElementById('tree-container').innerHTML = renderTraceTree(rootNode ? [rootNode] : []);
      </script>
    </body>
    </html>
  `;
  iframe.srcdoc = htmlContent;

  // 将 iframe 添加到面板
  panel.appendChild(iframe);
  document.body.appendChild(panel);
}

// 注入代码跳转功能
window.jumpToCode = (location) => {
  console.log('Jump to:', location);
}; 