window.onload = function() {

  // Delay execution by 2 seconds
  addMagicButton();
};

function addMagicButton() {
  const forms = document.querySelectorAll('form');
  forms.forEach((form, index) => {
    const inputFields = form.querySelectorAll('input');
    const isSearchForm = form.querySelector('input[type="search"], [aria-label*="Search"], [placeholder*="Search"], [class*="search"], button[aria-label*="Search"], button[class*="search"]');
    const isSpecialForm = form.querySelector('[data-hydro-click], [data-ga-click], button[data-view-component]');
    
    if (inputFields.length >= 2 && !isSearchForm && !isSpecialForm) {
      const submitButton = form.querySelector('[type="submit"]');
      if (submitButton) {
        const magicButton = document.createElement('button');
        magicButton.type = 'button';
        magicButton.innerHTML = 'Magic Form';
        magicButton.className = 'magic-button';
        magicButton.style.cssText = 'background-color: #ff5d7a; color: white; border: 4px solid peachpuff; padding: 10px; margin: 5px; cursor: pointer; border-radius: 4px;';
        submitButton.insertAdjacentElement('afterend', magicButton);
        magicButton.addEventListener('click', async function() {
          // Indicate loading by changing text and background color
          magicButton.innerHTML = 'Filling...';
          magicButton.style.backgroundColor = 'orange';
          console.log("Just before button form filling");
          // Fill the form
          await fillForm(form);
          // Revert to original state
          console.log("Form is filled");
          magicButton.innerHTML = 'Magic Form';
          magicButton.style.backgroundColor = '#ff5d7a';
        });
      }
    }
  });
}


async function fillForm(form) {
  return new Promise((resolve, reject) => {
  chrome.storage.local.get([
    'apiKey', 'name', 'email', 'phone', 'prompt', 
    'enableHomePageScraping', 'homePageWordCount', 
    'enableCurrentPageScraping', 'currentPageWordCount'
  ], async function(result) {
    const apiKey = result.apiKey;
    const name = result.name;
    const email = result.email;
    const phone = result.phone;
    const prompt = result.prompt;
    const enableHomePageScraping = result.enableHomePageScraping;
    const homePageWordCount = result.homePageWordCount;
    const enableCurrentPageScraping = result.enableCurrentPageScraping;
    const currentPageWordCount = result.currentPageWordCount;

    const currentUrl = new URL(window.location.href);
    const baseUrl = `${currentUrl.protocol}//${currentUrl.hostname}`;

    homePageContent={};
    currentPageContent={};
    if(enableHomePageScraping){
      console.log('enable HomePage:',enableHomePageScraping);
    homePageContent = await webdata(baseUrl,homePageWordCount);
    }
    if(enableCurrentPageScraping){
    console.log('enable current:',enableCurrentPageScraping);
    currentPageContent = await webdata(window.location.href,currentPageWordCount);
    }
    if(homePageContent || currentPageContent){

      content=`Personalize the answer based on the content of the website ${homePageContent} ${currentPageContent}`;
    }
    console.log(content);
     // Step 1: Collect form fields
     const formFields = {};
     const inputs = form.querySelectorAll("input, textarea, select");

     let counter = 0;

     for (const input of inputs) {
       if (counter >= 8) break;
      
  const label = form.querySelector(`label[for="${input.id}"]`);
  const labelText = label ? label.textContent.toLowerCase() : '';

  if (input.name.toLowerCase().includes("name") || 
      input.placeholder.toLowerCase().includes("name") || 
      input.getAttribute('autocomplete') === 'name' ||
      labelText.includes("name")) {
    input.value = name;
  }
  else if (input.name.toLowerCase().includes("email") || 
           input.placeholder.toLowerCase().includes("email") || 
           input.getAttribute('autocomplete') === 'email' ||
           labelText.includes("email")) {
    input.value = email;
  }
  else if (input.name.toLowerCase().includes("phone") || 
           input.placeholder.toLowerCase().includes("phone") || 
           input.getAttribute('autocomplete') === 'tel' ||
           labelText.includes("phone")) {
    input.value = phone;
  }

       else {
        if (input.type !== 'submit' && input.type !== 'hidden' && !input.disabled) {
          const questionText = await fetchGPT(apiKey, `Answer this in minimum number of words. What is being asked in this html code of a form ${input.outerHTML}`);
          console.log(`Form outerHTML ${input.outerHTML}`);
          const promptText =`I am filling a form on ${baseUrl}. Help me answer this question '''${questionText}''' The answer should be based on following direction by user '''${prompt}''' ${content}`
          console.log(promptText);
          const answerText = await fetchGPT(apiKey, promptText);
      
          // Remove leading and trailing spaces
          let trimmedAnswerText = answerText.trim();

            if (trimmedAnswerText.startsWith('"')) {
              trimmedAnswerText = trimmedAnswerText.substring(1);
            }
            if (trimmedAnswerText.endsWith('"')) {
              trimmedAnswerText = trimmedAnswerText.substring(0, trimmedAnswerText.length - 1);
            }
      
          console.log(`Question: ${questionText} \n Answer:${trimmedAnswerText} \n Prompt:${prompt}`);
          input.value = trimmedAnswerText;
        }
      }
      counter++;
      console.log(counter);
    }
    resolve();  
  });
});
}
 

 
 async function fetchGPT(openapi,prompt) {
  const apiKey = openapi;
  const apiURL = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
  const body = JSON.stringify({
    model: "gpt-4",
    messages: [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": prompt
      }
    ]
  });

  const response = await fetch(apiURL, {
    method: "POST",
    headers: headers,
    body: body
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}


async function webdata(baseUrl,wordCount) {


const response = await fetch(baseUrl);
const text = await response.text();
const parser = new DOMParser();
const doc = parser.parseFromString(text, "text/html");

let content = "";
["h1", "h2"].forEach(tag => {
  const elements = doc.querySelectorAll(tag);
  elements.forEach(el => {
    content += el.textContent + " ";
  });
});

const words = content.split(" ");
const limitedWords = words.slice(0, wordCount).join(" ");

return limitedWords;
}