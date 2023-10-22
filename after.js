(function() {
  console.log('after.js executed');

  const forms = document.querySelectorAll('form');

  if (forms.length > 0) {
    forms.forEach((form) => {
      const submitButtons = form.querySelectorAll('input[type="submit"], button[type="submit"]');
      
      if (submitButtons.length > 0) {

        const magicButton = document.createElement("button");
        magicButton.innerText = "Magic Form";
        magicButton.style.marginLeft = "12px";
        magicButton.style.background = `pink`;

        magicButton.addEventListener("click", async () => {
          generateFormData();
        });

        // submitButtons.forEach((submitButton) => {
        //   submitButton.insertAdjacentElement('afterend', magicButton.cloneNode(true));
        // });

        // firstSubmitButton.insertAdjacentElement('afterend', magicButton.cloneNode(true));

        // Append Magic Button outside the form
        form.parentNode.insertBefore(magicButton, form.nextSibling);
      }
    });
  }
  
  async function fillForm(form) {
    const inputData = await loadData();
    console.log('Input Data', inputData);
    
    const inputs = form.querySelectorAll('input, textarea, select');
    
    for (const input of inputs) {
      await fillInput(input, inputData);
    }
  }

  async function fillInput(input, inputData) {

    console.log("Fill Input", input)
    const identifier = findIdentifier(input);
    const keys = Object.keys(inputData);
    const matchingKey = keys.find(key => identifier.includes(key.toLowerCase()));
  
    if (matchingKey) {
      input.value = inputData[matchingKey];
    } else {
      await fillUnknownField(input, identifier, inputData);
    }
  }

  function findIdentifier(input) {
    let identifier = input.name || input.placeholder || '';
    const label = document.querySelector(`label[for="${input.id}"]`);
  
    if (label) {
      identifier = label.textContent;
    }  
    return identifier.toLowerCase();
  }
  
async function fillUnknownField(input, identifier, inputData) {
  if (input.type !== 'submit' && input.type !== 'button') {
    if (inputData['prompt']) {
      const content = await webdata();
      const prompt = `What should I fill in for the field with label "${identifier}" on educator's website? ${inputData['prompt']} ${content}`;
      const gptResponse = await fetchGPT(prompt);
      input.value = gptResponse;
    } else {
      input.value = 'magic';
    }
  }
}

  
  async function generateFormData() {
  
    // Find the first form on the page
    const form = document.querySelector('form');
  
    // Main part
    if (form) {
      fillForm(form).then(() => {
        console.log('Form Filled');
      }).catch((err) => {
        console.log('Error Filling Form:', err);
      });
    }

    // if (form) {

    //   let inputData = await loadData();
    //   console.log('Input Data', inputData);
    //     // Find all input fields within the form
    //     const inputs = form.querySelectorAll('input, textarea, select');
  
    //     // Loop through each input field and fill it
    //     for (const input of inputs) {
    //         let identifier = input.name.toLowerCase() || input.placeholder.toLowerCase();
    //         let label = document.querySelector(`label[for="${input.id}"]`);
  
    //         if (label) {
    //             identifier = label.textContent.toLowerCase();
    //         }
  
    //         const keys = Object.keys(inputData);
    //         const matchingKey = keys.find(key => identifier.includes(key));
  
    //         if (matchingKey) {
    //             input.value = inputData[matchingKey];
    //         } else if (input.type !== 'submit' && input.type !== 'button') {
    //             if (inputData['prompt']) {
    //                 content = await webdata();
    //                 const prompt = `What should I fill in for the field with label "${identifier}" on educator's website? ${inputData['prompt']} ${content}`;
    //                 console.log(`Prompt: ${prompt}`);
    //                 const gptResponse = await fetchGPT(prompt);
    //                 input.value = gptResponse;
    //             }
    //             else {
    //                 input.value = 'magic';
    //             }
    //         }
    //     }
    // }
  }
  
  async function loadData() {

    // let response = await fetch(chrome.runtime.getURL('data.txt'));
    // let data = response.text();

    let data = {};
    // Load saved data from local storage
    chrome.storage.local.get([
      'apiKey', 'name', 'email', 'phone', 'prompt', 
      'enableHomePageScraping', 'homePageWordCount', 
      'enableCurrentPageScraping', 'currentPageWordCount'
    ], (result) => {
      if (result.apiKey) data['apiKey'] = result.apiKey;
      if (result.name) data['name'] = result.name;
      if (result.email) data['email'] = result.email;
      if (result.phone) data['phone'] = result.phone;
      if (result.prompt) data['prompt']  = result.prompt;
      if (result.enableHomePageScraping) data['enableHomePageScraping']  = true;
      if (result.homePageWordCount) data['homePageWordCount']  = result.homePageWordCount;
      if (result.enableCurrentPageScraping) data['enableCurrentPageScraping']  = true;
      if (result.currentPageWordCount) data['currentPageWordCount'] = result.currentPageWordCount;
    });


    return data;
  }
  
  
  
  async function fetchGPT(prompt) {
    const apiKey = "<your-openai-api-key>";
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
  
  
  async function webdata() {
    const currentUrl = new URL(window.location.href);
    const baseUrl = `${currentUrl.protocol}//${currentUrl.hostname}`;
  
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
  
    // Limit to 300 words
    const words = content.split(" ");
    const limitedWords = words.slice(0, 200).join(" ");
  
    return limitedWords;
  }
  
  
})();
