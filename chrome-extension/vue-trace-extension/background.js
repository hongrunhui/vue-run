// 记录日志以确认脚本加载
console.log("Background script loaded");

chrome.runtime.onConnect.addListener(function(port) {
  console.log("Port connected:", port.name);
  
  if (port.name === "vue-trace-panel") {
    port.onMessage.addListener(function(msg) {
      console.log("Background received message:", msg);
      // 可以在这里处理来自面板的消息
    });
    
    port.onDisconnect.addListener(function() {
      console.log("Port disconnected:", port.name);
    });
  }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log("Tab updated:", tabId, changeInfo);
}); 