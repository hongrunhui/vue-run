console.log("Vue Trace content script loaded");

// 监听来自页面的消息
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'VUE_TRACE_DATA') {
    chrome.runtime.sendMessage({
      type: 'VUE_TRACE_DATA',
      data: event.data.data
    });
  }
}); 