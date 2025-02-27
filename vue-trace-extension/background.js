// 记录日志以确认脚本加载
console.log("Background script loaded");

chrome.runtime.onConnect.addListener(function(port) {
  console.log("Port connected:", port.name);
  
  if (port.name === "vue-trace-panel") {
    port.onMessage.addListener(function(msg) {
      console.log("Background received message:", msg);
    });
    
    port.onDisconnect.addListener(function() {
      console.log("Port disconnected:", port.name);
    });
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log("Tab updated:", tabId, changeInfo);
}); 