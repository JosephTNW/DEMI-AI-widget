(function() {
    var style = document.createElement('link');
    style.type = 'text/css';
    style.rel = 'stylesheet';
    style.href = "https://rynhan.github.io/DEMI-AI-widget/widget.css"
    document.getElementsByTagName('head')[0].appendChild(style);

    fetch('https://rynhan.github.io/DEMI-AI-widget/widget.html').then(response => {  
        return response.text()
    }).then(data=>{
        document.body.insertAdjacentHTML( 'beforeend', data );
    })
})()

const chatbotToggle   = document.querySelector(".chatbot-toggler");
const chatBox         = document.querySelector(".chatbox");
const chatInput       = document.querySelector(".chat-input textarea");
const sendChatBtn     = document.querySelector(".chat-input span");
const chatBotCloseBtn = document.querySelector(".close-btn");

const inputInitHeight = chatInput.scrollHeight;









function toHyperlink(txt) { // to find URLs within the string and convert them into clickable hyperlinks.
    
    // The function uses two regular expressions (`pattern1` and `pattern2`) to match URLs in different formats. 
    // The first pattern (`pattern1`) matches URLs starting with http, https, ftp, and file protocols.
    // While the second pattern (`pattern2`) matches URLs starting with "www".
    
    var pattern1 = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    var str1 = txt.replace(pattern1, "<a href='$1'>$1</a>");
    
    var pattern2 =/(^|[^\/])(www\.[\S]+(\b|$))/gim;
    var str2 = str1.replace(pattern2, '$1<a target="_blank" href="http://$2">$2</a>');

    return str2;
}

// Default bot image URL, replace this with the actual URL of your bot's image
const botImageUrl = "https://rynhan.github.io/DEMI-AI-widget/D3.png";
const createChatLi = (message, className, imageUrl = botImageUrl) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);

    if (className === "incoming") {
        if (imageUrl) {
            const image = document.createElement("img");
            image.src = imageUrl;
            image.alt = "Bot Image";
            chatLi.appendChild(image);
        }
    }
    var formattedMessage = toHyperlink(message);
    var messageContent = document.createElement("p");
    messageContent.innerHTML = formattedMessage;

    chatLi.appendChild(messageContent);
    
    return chatLi;
}

const sanitizeUserMessage = (message) => {
    // Replace '<' and '>' characters with their HTML entity equivalents to prevent rendering HTML tags.
    return message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};











let userMessage; // a container where we will put the clean message here (trimmed message)
var chatHistory = []; // all of the chat history are stored here




const handleChat = () => {
    // Clean the user input
    userMessage = chatInput.value.trim(); // removes whitespace from both sides (right and left) of an input string and stored in userMessage var
    if(!userMessage) return; // if the userMessage contains nothing, nothing will happen

    // Sanitize user input to prevent rendering HTML tags.
    const sanitizedUserMessage = sanitizeUserMessage(userMessage);

    //Append user message to chatbox
    chatBox.appendChild(createChatLi(sanitizedUserMessage, "outgoing")); // append chatBox ul with new li message from user 
    chatBox.scrollTo(0, chatBox.scrollHeight); // scroll down
    chatHistory.push( {role:'user', content: sanitizedUserMessage} ) // push the previous user chat into chatHistory

    console.log(chatHistory);

    // Summoning gpt-3.5-turbo-16k or whatever
    // https://platform.openai.com/docs/api-reference/chat
    console.log("Calling gpt-3.5-turbo-16k")
    // var url = "http://localhost:6600/chat";
    var url = "https://relieved-top-coat-toad.cyclic.cloud/chat";
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pesan: chatHistory
        })
    }).then(response => {  
        return response.json() // after we gave the model time to think, we got the response in json format
    }).then(data=>{
        console.log(data.choices[0].message.content) // all the json data are here
        console.log(data.choices[0].message) // only the message
        chatBox.appendChild(createChatLi(data.choices[0].message.content, "incoming")) // append chatBox ul with new li message from assistant 
        chatBox.scrollTo(0, chatBox.scrollHeight); // scroll down
        chatHistory.push(data.choices[0].message) // push the previous assistant chat into chatHistory
    }).catch(error => {
        console.log('Something bad happened ' + error)
    });
    
    chatInput.value = ""; // always make sure the input text is empty to type

}









chatInput.addEventListener('input', () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});
chatbotToggle.addEventListener('click', () =>
    document.body.classList.toggle('show-chatbot')
);
chatBotCloseBtn.addEventListener('click', () =>
    document.body.classList.remove('show-chatbot')
);
sendChatBtn.addEventListener('click', handleChat);
