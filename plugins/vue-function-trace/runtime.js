// 记录函数执行信息
class FunctionTracer {
  constructor() {
    this.traces = []
    this.currentNode = null
    window.__VUE_TRACE__ = this
  }

  // 记录函数进入
  enter(functionInfo) {
    const node = {
      name: functionInfo.name,
      args: functionInfo.args,
      parent: this.currentNode,
      children: [],
      startTime: Date.now(),
      location: functionInfo.location
    }
    
    if (this.currentNode) {
      this.currentNode.children.push(node)
    } else {
      this.traces.push(node)
    }
    
    this.currentNode = node
    return node
  }

  // 记录函数退出
  exit(node, returnValue) {
    node.endTime = Date.now()
    node.returnValue = returnValue
    this.currentNode = node.parent
  }
}

// 初始化 UI
export function initTraceUI() {
  // 确保 FunctionTracer 在页面加载时就初始化
  if (!window.__VUE_TRACE__) {
    new FunctionTracer();
  }

  const button = document.createElement('button')
  button.innerText = '查看函数调用树'
  button.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 9999;
  `
  
  button.onclick = () => {
    showTracePanel()
  }

  document.body.appendChild(button)
}

// 显示函数调用面板
function showTracePanel() {
  const traces = window.__VUE_TRACE__.traces
  
  const panel = document.createElement('div')
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
  `
  
  panel.innerHTML = `
    <div class="trace-tree">
      ${renderTraceTree(traces)}
    </div>
  `
  
  document.body.appendChild(panel)
}

// 渲染调用树 HTML
function renderTraceTree(nodes) {
  return nodes.map(node => `
    <div class="tree-node">
      <div class="node-content" onclick="jumpToCode('${node.location}')">
        ${node.name} 
        <span class="time">(${node.endTime - node.startTime}ms)</span>
      </div>
      ${node.children.length ? `
        <div class="children">
          ${renderTraceTree(node.children)}
        </div>
      ` : ''}
    </div>
  `).join('')
}

// 注入代码跳转功能
window.jumpToCode = (location) => {
  // 这里需要和编辑器集成,实现代码跳转
  console.log('Jump to:', location) 
} 