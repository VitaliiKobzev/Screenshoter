chrome.commands.onCommand.addListener(function(command) {
  if (command === 'capture-screenshot') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var tab = tabs[0];
      if (!tab) {
        return;
      }
      chrome.tabs.captureVisibleTab(tab.windowId, {}, function(dataUrl) {
        if (chrome.runtime.lastError || !dataUrl) {
          console.error(chrome.runtime.lastError);
          return;
        }
        var name = generateFileName();
        chrome.downloads.download({
          url: dataUrl,
          filename: name + '.jpg',
          saveAs: false
        });
      });
    });
  }
});

function generateFileName() {
  var d = new Date();
  var day = String(d.getDate()).padStart(2, '0');
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var year = String(d.getFullYear()).slice(-2);
  var ms = d.getTime();
  return day + '_' + month + '_' + year + '_' + ms;
}