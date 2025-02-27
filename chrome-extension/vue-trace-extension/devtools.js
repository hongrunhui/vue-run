// 创建面板
chrome.devtools.panels.create(
  "Vue Trace",
  null,  // 不使用图标
  "panel.html",  // 使用相对路径
  function(panel) {
    console.log("Vue Trace panel created");
    
    // 监听面板显示事件
    panel.onShown.addListener(function(panelWindow) {
      console.log("Panel shown");
      // 确保 panel.js 已加载
      if (panelWindow.document.readyState === 'complete') {
        console.log("Panel window loaded");
      }
    });
    
    // 监听面板隐藏事件
    panel.onHidden.addListener(function() {
      console.log("Panel hidden");
    });
  }
);

// 添加侧边栏
chrome.devtools.panels.elements.createSidebarPane(
  "Vue Trace",
  function(sidebar) {
    console.log("Sidebar created");
  }
);

// 记录日志以确认脚本加载
console.log("Vue Trace DevTools Extension loaded"); 