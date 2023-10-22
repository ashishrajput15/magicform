
console.log('content-script.js executed');

generateFormData();


async function generateFormData() {

    let data = await loadData();

    const lines = data.split('\n');
    const formData = {};

    // Parse lines from data.txt into formData object
    lines.forEach(line => {
        const [key, value] = line.split(': ');
        formData[key.toLowerCase()] = value;
    });

    // Find the first form on the page
    const form = document.querySelector('form');

    if (form) {
        // Find all input fields within the form
        const inputs = form.querySelectorAll('input, textarea, select');

        // Loop through each input field and fill it
        for (const input of inputs) {
            let identifier = input.name.toLowerCase() || input.placeholder.toLowerCase();
            let label = document.querySelector(`label[for="${input.id}"]`);

            if (label) {
                identifier = label.textContent.toLowerCase();
            }

            const keys = Object.keys(formData);
            const matchingKey = keys.find(key => identifier.includes(key));

            if (matchingKey) {
                input.value = formData[matchingKey];
            } else if (input.type !== 'submit' && input.type !== 'button') {
                if (formData['goal']) {
                    content = await webdata();
                    const prompt = `What should I fill in for the field with label "${identifier}" on educator's website? ${formData['goal']} ${content}`;
                    console.log(`Prompt: ${prompt}`);
                    const gptResponse = await fetchGPT(prompt);
                    input.value = gptResponse;
                }
                else {
                    input.value = 'magic';
                }
            }
        }
    }
}

async function loadData() {
    let response = await fetch(chrome.runtime.getURL('data.txt'));
    let data = response.text();

    return data;
}



async function fetchGPT(prompt) {
    const apiKey = "sk-IBzSiHyV7VBvnnG00zh8T3BlbkFJdhIuTsWPWhXJSht1yfl";
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
    const baseUrl = `${currentUrl.protocol}//${currentUrl.hostname}`;  // Extract the base URL

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
    const limitedWords = words.slice(0, 100).join(" ");

    return limitedWords;
}
