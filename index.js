let model = "text-davinci-003";
let apiKey;
let inputElement;
let outputElement;


document.addEventListener("DOMContentLoaded", function () {

    inputElement = document.getElementById("prompt");
    outputElement = document.getElementById("tempResponse");

    //Stores key in localstorage
    apiKeyElement = document.getElementById("key");
    const OPENAI_API_KEY = "OPENAI_API_KEY";
    apiKeyElement.addEventListener('change', (event) => {
        let key = event.target.value;
        localStorage.setItem(OPENAI_API_KEY, key);
    });
    if (localStorage.getItem(OPENAI_API_KEY)) {
        apiKeyElement.value = localStorage.getItem(OPENAI_API_KEY);
    }

    setResponse("Hello, please type something");
});

function generatePictureBook() {
  const promptInput = document.getElementById("prompt");
  apiKey = document.getElementById("key").value;
  const promptText = promptInput.value.trim();

  if (apiKey === "") {
    alert("Please enter an API Key.");
    return;
  }

  if (promptText === "") {
      alert("Please enter a prompt.");
      return;
  }

  generateResponse(promptText);
}

function setResponse (sentence) {
    if (sentence === "HTTP ERROR: 401") {
        sentence += " — Your API Key has not been set properly.";
    }
    outputElement.innerText = sentence;
    return;
}

async function generateResponse(promptText) {
    setResponse("Waiting...");

    if (promptText) {
        try {
            const response = await fetch('https://api.openai.com/v1/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                },
                body: JSON.stringify({
                    'model': model,
                    'prompt': promptText,
                    'temperature': 0,
                    'max_tokens': 1000,
                    'top_p': 1,
                    'frequency_penalty': 1.2,
                    'presence_penalty': 0
                })
            });

            if (!response.ok) {
                console.error("HTTP ERROR: " + response.status + "\n" + response.statusText);
                setResponse("HTTP ERROR: " + response.status);
            } else {
                //Succesful API call!!
                const data = await response.json();
                let responseText = createResponse(data)
                setResponse(responseText);

                let img = document.getElementById("tempImageResponse");
                setImage(responseText, img);
            }
        } catch (error) {
            console.error("ERROR: " + error);
        }
    } else {
        await setResponse("Please enter a prompt and select an engine");
    }
}

function removePeriod(json) {
    json.forEach(function (element, index) {
        if (element === ".") {
            json.splice(index, 1);
        }
    });
    return json;
}

function createResponse(json) {
    let response = "";
    let choices = removePeriod(json.choices);
    if (choices.length > 0) {
        response = json.choices[0].text
    }

    return response;
}



async function setImage (imagePrompt, imgElement) {
    const options = {
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: imagePrompt,
            n: 1,
            size: "1024x1024"
        })
    }
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', options)
        const data = await response.json()
        data?.data.forEach(imageObject => {
            let imageSource = imageObject.url;
            console.log (imageSource);
            imgElement.src = imageSource;
        })
    } catch (error) {
        console.error("THERE WAS AN ERROR: " + error);
    }
}


















async function generateText(promptText) {
  const requestOptions = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
          model: 'text-davinci-002',
          prompt: promptText,
          max_tokens: 200,
          n: 1,
          stop: null,
          temperature: 0.7
      })
  };

  const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', requestOptions);
  const data = await response.json();
  const generatedText = data.choices[0].text.trim();

  return generatedText;
}

/*
async function generateImage(promptText) {
  // Replace this with your actual API call to Dall-E
  var imageSrc = 'https://via.placeholder.com/150';
  return imageSrc;
}
*/

async function generateImageOld(promptText) {
  const requestOptions = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
          model: 'image-alpha-001',
          prompt: promptText,
          n: 1,
          size: '256x256',
          response_format: 'url'
      })
  };

  const response = await fetch('https://api.openai.com/v1/images/generations', requestOptions);
  const data = await response.json();
  const imageSrc = data.data[0].url;

  return imageSrc;
}

  // Call the API to generate the picture book (not

  async function createPictureBook(promptText) {
    // Generate text content for a storybook using GPT-3.5 API
    const generatedText = await generateText(promptText);

    // Divide the text into paragraphs
    const paragraphs = generatedText.split('\n\n');

    // Create a new HTML page to display the text in a picture-book format
    const bookWindow = window.open('', '_blank');
    bookWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Generated Picture Book</title>
            <link rel="stylesheet" href="index.css">
        </head>
        <body>
            <div class="book-container">
                <h1 class="book-title">${promptText}</h1>
            </div>
        </body>
        </html>
    `);

    // Add the generated text and images to the new HTML page
    const bookContainer = bookWindow.document.querySelector('.book-container');
    paragraphs.forEach(async (paragraph, index) => {
        // Create an image for each paragraph using Dall-E
        const imageSrc = await generateImage(paragraph);

        // Add the paragraph and image to the new HTML page
        bookContainer.innerHTML += `
            <div class="paragraph">
                ${paragraph}
                <img src="${imageSrc}" alt="Generated illustration">
            </div>
        `;
    });
}