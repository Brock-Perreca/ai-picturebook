let model = "text-davinci-003";
let apiKey;
let isGenerating = false;
let inputElement;
let outputElement;
let updateZone;
let storyPreface = "Create a 6 paragraph children's story book based on the following prompt: "
let imagePromptPreface = "Visually desribe the following text to create a Dall-E image generation prompt: ";
let dallEPreface = "cartoon ";

let prompt = "";
let paragraphList =  [];
let imgList = [];
let titleImg = "";

document.addEventListener("DOMContentLoaded", function () {

    inputElement = document.getElementById("prompt");
    outputElement = document.getElementById("tempResponse");
    updateZone = document.getElementById("update-zone");

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
});

async function generatePictureBook() {
    if (isGenerating) {
        updateLog("Story is already being created");
        return;
    } else {
        isGenerating = true;
    }
    console.log("Creation has begun");
    updateZone.innerText = "Creation has begun";

    updatePrefaces();

    const promptInput = document.getElementById("prompt");
    apiKey = document.getElementById("key").value;
    prompt = promptInput.value.trim();

    if (apiKey === "") {
        updateLog("Please enter an API Key.");
        isGenerating = false;
        return;
    }

    if (prompt === "") {
        updateLog("Please enter a prompt.");
        isGenerating = false;
        return;
    }

    document.getElementById("open-book-button").style.display = "none";

    let responseText = await generateResponse(prompt, storyPreface);
    console.log(responseText);

    if (responseText === "HTTP ERROR: 401") {
    responseText += " — Your API Key has not been set properly.";
        updateLog(responseText);
    }

    paragraphList = [];
    paragraphList = getParagraphs(responseText);
    console.log("List of paragraphs");
    console.log(paragraphList);
    updateLog("Story text created")

    let imgPromptPromiseList = [];
    for (let paragraph of paragraphList) {
        imgPromptPromiseList.push(generateResponse(paragraph, imagePromptPreface))
    }
    const imgPromptList = await Promise.all(imgPromptPromiseList);
    console.log("List of image prompts");
    console.log(imgPromptList);
    updateLog("Image prompts created");


    let imgPromiseList = [];
    for (let imgPrompt of imgPromptList) {
        imgPromiseList.push(generateImage(imgPrompt, dallEPreface));
    }
    imgList = await Promise.all(imgPromiseList);
    console.log("List of image URLs");
    console.log(imgList);
    updateLog("Images created")

    document.getElementById("open-book-button").style.display = "block"
    isGenerating = false;
}

function updatePrefaces() {
    let length = document.getElementById("length-slider").value;
    console.log(`Length of the book is ` + length);
    let theme = document.getElementById("theme-selector").value;
    console.log(`Theme of the book is ` + theme)
    storyPreface = `Create a `+ length + ` paragraph ` + theme + ` story based on the following prompt: `

    let style = document.getElementById("style-selector").value;
    console.log(`Art style of the book is ` + style);
    imagePromptPreface = `Visually desribe the following scene to create a Dall-E image generation prompt with a ` + style + ` style: `;
    dallEPreface = style + " "
}

function getParagraphs(text) {
    // split text into paragraphs
    var paragraphs = text.split("\n\n");

    // remove empty paragraphs
    paragraphs = paragraphs.filter(function (paragraph) {
        return paragraph.trim() !== "";
    });

    return paragraphs;
}

function updateLog (sentence) {
  updateZone.innerHTML += "<br>" + sentence;
}

async function generateResponse(prompt, preface) {
    if (prompt) {
        promptText = preface + prompt;
        try {
            //console.log(`Text API call: ` + promptText);
            const response = await fetch('https://api.openai.com/v1/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                },
                body: JSON.stringify({
                    'model': model,
                    'prompt': promptText,
                    'temperature': 0.1,
                    'max_tokens': 1000,
                    'top_p': 1,
                    'frequency_penalty': 1.2,
                    'presence_penalty': 0
                })
            });

            if (!response.ok) {
                console.error("HTTP ERROR: " + response.status + "\n" + response.statusText);
                updateLog("HTTP ERROR: " + response.status);
            } else {
                //Succesful API call!!
                const data = await response.json();
                let responseText = createResponse(data)
                return responseText;
            }
        } catch (error) {
            console.error("ERROR: " + error);
        }
    } else {
        await updateLog("Please enter a prompt");
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

async function generateImage (imagePrompt, preface) {
    imagePrompt = preface + imagePrompt;
    const options = {
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: imagePrompt,
            n: 1,
            size: "512x512"
        })
    }
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', options);
        const data = await response.json();
        let url = data.data[0].url;
        return (url);
    } catch (error) {
        console.error("THERE WAS AN ERROR: " + error);
    }
}


function createPictureBook() {
    try {
            const bookWindow = window.open('', '_blank');
            let title = generateResponse(prompt, "Create the title of a children's story book that is about the following: ");
            let bookHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>AIBookPage</title>
            <meta property="og:title" content="AIBookPage" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta charset="utf-8" />
            <meta property="twitter:card" content="summary_large_image" />

            <style data-tag="reset-style-sheet">
            html {  line-height: 1.15;}body {  margin: 0;}* {  box-sizing: border-box;  border-width: 0;  border-style: solid;}p,li,ul,pre,div,h1,h2,h3,h4,h5,h6,figure,blockquote,figcaption {  margin: 0;  padding: 0;}button {  background-color: transparent;}button,input,optgroup,select,textarea {  font-family: inherit;  font-size: 100%;  line-height: 1.15;  margin: 0;}button,select {  text-transform: none;}button,[type="button"],[type="reset"],[type="submit"] {  -webkit-appearance: button;}button::-moz-focus-inner,[type="button"]::-moz-focus-inner,[type="reset"]::-moz-focus-inner,[type="submit"]::-moz-focus-inner {  border-style: none;  padding: 0;}button:-moz-focus,[type="button"]:-moz-focus,[type="reset"]:-moz-focus,[type="submit"]:-moz-focus {  outline: 1px dotted ButtonText;}a {  color: inherit;  text-decoration: inherit;}input {  padding: 2px 4px;}img {  display: block;}html { scroll-behavior: smooth  }
            </style>
            <style data-tag="default-style-sheet">
            html {
                font-family: Inter;
                font-size: 16px;
            }

            body {
                font-weight: 400;
                font-style:normal;
                text-decoration: none;
                text-transform: none;
                letter-spacing: normal;
                line-height: 1.15;
                color: var(--dl-color-gray-black);
                background-color: var(--dl-color-gray-white);

            }
            </style>
            <link
            rel="shortcut icon"
            href="public/robinweatherall-library-book.32.png"
            type="icon/png"
            sizes="32x32"
            />
            <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&amp;display=swap"
            data-tag="font"
            />

            <link rel="stylesheet" href="./book.css" />
        </head>
        <body>
            <div>
            <link href="./home.css" rel="stylesheet" />

            <div class="home-container">
                <div class="home-container1"><h1 id="prompt-text">Prompt</h1></div>
                <div class="home-container2">
                <div class="home-container3" id="title-page">
                    <h1 class="home-text1" id="title-page-title">Book Title</h1>
                    <span class="home-text2">By OpenAI and Brock Perreca</span>
                    <img
                    src="https://play.teleporthq.io/static/svg/default-img.svg"
                    alt="image"
                    class="home-image"
                    id="title-img"
                    />
                </div>
                <div class="home-container4" id="left-page">
                    <img
                    alt="image"
                    src="https://play.teleporthq.io/static/svg/default-img.svg"
                    class="home-image1"
                    id="page-img"
                    />
                </div>
                <div class="home-container5" id="right-page"><span id="page-text">Text</span></div>
                </div>
                <div class="home-container6">
                <button class="button" onclick="prevPage()">Prev</button>
                <span class="home-text4" id="page-number">0</span>
                <button class="button" onclick="nextPage()">Next</button>
                </div>
            </div>
            </div>

            <script>
            let prompt = ${JSON.stringify(prompt)};
            let title = ${JSON.stringify(title)};
            let textList = ${JSON.stringify(paragraphList)};
            let urlList = ${JSON.stringify(imgList)};
            let titleImgSrc = ${JSON.stringify(titleImg)};

            let page = 0;
            let maxPage = textList.length;

            let pageElem = document.getElementById("page-number");
            let promptText = document.getElementById("prompt-text");
            let titlePage = document.getElementById("title-page");
            let titlePageTitle = document.getElementById("title-page-title");
            let leftPage = document.getElementById("left-page");
            let titleImg = document.getElementById("title-img");
            let img = document.getElementById("page-img");
            let rightPage = document.getElementById("right-page");
            let pageText = document.getElementById("page-text");

            titlePageTitle.innerText = prompt;
            promptText.innerText = prompt;
            titleImg.src = titleImgSrc;
            titleImg.style.display = "none";


            function nextPage() {
                if (page == maxPage) {
                return;
                }
                if (page == 0) {
                titlePage.style.display = "none";
                leftPage.style.display = "flex";
                rightPage.style.display = "flex";
                }
                page++
                updatePage();
            }

            function prevPage() {
                if (page == 0) {
                return;
                }
                if (page == 1) {
                    titlePage.style.display = "flex";
                    leftPage.style.display = "none";
                    rightPage.style.display = "none";
                }
                page--;
                updatePage();
            }

            function updatePage() {
                pageElem.innerText = page.toString();
                pageText.innerText = textList[page - 1];
                img.src = urlList[page - 1];
            }

            </script>
        </body>
        </html>

        `;

            bookWindow.document.write(bookHTML);
            updateLog("Book created in a new window!");
        }
        catch (error) {
            updateLog("Please enable popups!")
        }
}