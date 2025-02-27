import { render } from 'solid-js/web';
import './index.css'; // 引入 Less 样式
import TraceTree from './components/TraceTree'; // 引入 TraceTree 组件

// 初始化
const init = () => {
  const rootNode = window.parent.__VUE_TRACE__.rootNode;
  renderTraceTree(rootNode ? [rootNode] : []);
};

// 渲染页面
const App = () => (
  <div>
    <h1>函数调用树</h1>
    <div id="tree-container">
      <TraceTree nodes={window.parent.__VUE_TRACE__.rootNode ? [window.parent.__VUE_TRACE__.rootNode] : []} />
    </div>
  </div>
);

// 渲染 Solid.js 组件
render(App, document.getElementById('app'));
init(); 