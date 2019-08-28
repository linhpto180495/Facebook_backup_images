chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.windows.create({
    url: chrome.runtime.getURL("main.html"),
    type: "popup"
  });
});

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg && msg.length) {
      chrome.tabs.create({
        url: msg,
        active: true
      });
    } else {
      chrome.runtime.getPackageDirectoryEntry(function(directoryEntry) {
        directoryEntry.getDirectory("backupdata", {}, function(
          subDirectoryEntry
        ) {
          var directoryReader = subDirectoryEntry.createReader();
          // etc.. same code as in previous snippet.
          var filenames = [];
          (function readNext() {
            directoryReader.readEntries(function(entries) {
              if (entries.length) {
                for (var i = 0; i < entries.length; ++i) {
                  filenames.push(entries[i].name);
                }
                readNext();
              } else {
                // No more entries, so all files in the directory are known.
                // Do something, e.g. print all file names:
                console.log(filenames);
                filenames = filenames.filter(
                  item => item.includes(".html") || item.includes(".htm")
                );
                port.postMessage(JSON.stringify(filenames));
              }
            });
          })();
        });
      });
    }
  });
});
