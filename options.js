document.addEventListener('DOMContentLoaded', () => {
    // Load saved data from local storage
    chrome.storage.local.get([
      'apiKey', 'name', 'email', 'phone', 'prompt', 
      'enableHomePageScraping', 'homePageWordCount', 
      'enableCurrentPageScraping', 'currentPageWordCount'
    ], (result) => {
      if (result.apiKey) document.getElementById('apiKey').value = result.apiKey;
      if (result.name) document.getElementById('name').value = result.name;
      if (result.email) document.getElementById('email').value = result.email;
      if (result.phone) document.getElementById('phone').value = result.phone;
      if (result.prompt) document.getElementById('prompt').value = result.prompt;
      if (result.enableHomePageScraping) document.getElementById('enableHomePageScraping').checked = true;
      if (result.homePageWordCount) document.getElementById('homePageWordCount').value = result.homePageWordCount;
      if (result.enableCurrentPageScraping) document.getElementById('enableCurrentPageScraping').checked = true;
      if (result.currentPageWordCount) document.getElementById('currentPageWordCount').value = result.currentPageWordCount;
    });
  
    const form = document.getElementById('optionsForm');
    const toast = document.getElementById('toast');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const apiKey = document.getElementById('apiKey').value;
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const prompt = document.getElementById('prompt').value;
      const enableHomePageScraping = document.getElementById('enableHomePageScraping').checked;
      const homePageWordCount = document.getElementById('homePageWordCount').value;
      const enableCurrentPageScraping = document.getElementById('enableCurrentPageScraping').checked;
      const currentPageWordCount = document.getElementById('currentPageWordCount').value;
  
      // Save to local storage
      chrome.storage.local.set({
        apiKey, name, email, phone, prompt, 
        enableHomePageScraping, homePageWordCount, 
        enableCurrentPageScraping, currentPageWordCount
      }, () => {
        console.log('Options saved.');
        
        // Show toast
        toast.classList.remove('hidden');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
          toast.classList.add('hidden');
        }, 3000);
      });
    });
  });
  