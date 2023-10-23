chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'options.html' });
});

// event to run execute.js content when extension's button is clicked
// chrome.action.onClicked.addListener(execScript);

// async function execScript() {
//   const tabId = await getTabId();
//   chrome.scripting.executeScript({
//     target: {tabId: tabId},
//     files: ['execute.js']
//   });
// }

async function getTabId() {
  const tabs = await chrome.tabs.query({active: true, currentWindow: true});
  return (tabs.length > 0) ? tabs[0].id : null;
}

// background.js
let storedSentences = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'storeSentences') {
    storedSentences = message.data;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStoredSentences') {
    sendResponse(storedSentences);
  }
});

