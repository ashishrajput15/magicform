document.addEventListener('DOMContentLoaded', function() {
  // Show the loader initially
  document.getElementById('loader').style.display = 'block';

  // Clear previous results
  document.getElementById('emails').innerHTML = '';
  document.getElementById('phones').innerHTML = '';
  document.getElementById('socialLinks').innerHTML = '';

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['execute.js']
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'storeSentences') {
    // Hide the loader when data is received
    document.getElementById('loader').style.display = 'none';

    const { emails, socialLinks, phones } = request.data;

    // Filter out unwanted characters in emails
    const cleanedEmails = emails.map(email => email.replace(/mailto:%20/g, '').replace(/mailto:/g, '').replace(/%20/g, ' '));

    document.getElementById('emails').innerHTML = cleanedEmails.length ? cleanedEmails.join('<br>') : 'No emails found';
    document.getElementById('phones').innerHTML = phones.length ? phones.join('<br>') : 'No phones found';
    document.getElementById('socialLinks').innerHTML = socialLinks.length ? socialLinks.map(link => `<a href="${link}" target="_blank">${link}</a>`).join('<br>') : 'No social links found';
  }
  else if (request.action === 'showLoader') {
    // Show the loader
    document.getElementById('loader').style.display = 'block';
  }
  else if (request.action === 'hideLoader') {
    // Delay hiding the loader by 5 seconds
    setTimeout(() => {
      document.getElementById('loader').style.display = 'none';
    }, 5000);
  }
  
});
