// 创建面板
chrome.devtools.panels.create(
  "Vue Trace",
  "",
  "panel.html",
  function(panel) {
    console.log("Vue Trace panel created");
    
    // 监听面板显示事件
    panel.onShown.addListener(function(panelWindow) {
      console.log("Panel shown");
    });
    
    // 监听面板隐藏事件
    panel.onHidden.addListener(function() {
      console.log("Panel hidden");
    });
  }
);

// 记录日志以确认脚本加载
console.log("Vue Trace DevTools Extension loaded"); 