const apiKey = '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';

function generatePictureBook() {
  const promptInput = document.getElementById("prompt");
  //var apiKey = document.getElementById("key");
  const promptText = promptInput.value.trim();

  /*
  if (apiKey === "") {
    alert("Please enter an API Key.");
    return;
  }
  */
  if (promptText === "") {
      alert("Please enter a prompt.");
      return;
  }

  createPictureBook(promptText);

}

/*
async function generateText(promptText) {
  // Replace this with your actual API call to GPT-3.5
  var generatedText = `
      Once upon a time, ${promptText}...
      
      This is the second paragraph of the story...
      
      This is the third paragraph of the story...
  `;
  return generatedText;
}
*/

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

async function generateImage(promptText) {
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

