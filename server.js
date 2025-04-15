const express = require('express');
const app = express();
const handlebars = require("express-handlebars");
const Handlebars = require('handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');


const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
});


app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views/pages/'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

app.use(express.static(path.join(__dirname, 'public')));



// Welcome Page Route
app.get("/", (req, res) => {
    res.render("welcome", { title: "Welcome" });
});

// Chat Page Route
app.get("/chat", (req, res) => {
    res.render("chat", { title: "Chat" });
});

// placeholder chatbot Response Route
require('dotenv').config();

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
            {
                inputs: userMessage,
                parameters: {
                    max_new_tokens: 200,
                    temperature: 0.7,
                    do_sample: true
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const botReply = response.data.generated_text || response.data[0]?.generated_text;
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error calling Gemma API:", error.message);
        res.status(500).json({ reply: "Something went wrong with the model." });
    }
});


app.get("/people", (req, res) => {
    res.render("people", { title: "Team" });
});

// Start Server
app.listen(3000);
console.log('Server is listening on port 3000');
