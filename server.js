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
            "https://api.friendli.ai/dedicated/v1/completions",
            {
                model: process.env.ENDPOINT_ID,
                prompt: userMessage,
                min_tokens: 20,
                max_tokens: 100,
                top_k: 32,
                top_p: 0.8,
                n: 1,
                no_repeat_ngram: 3,
                ngram_repetition_penalty: 1.75
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const botReply = response.data.choices?.[0]?.text?.trim() || "No reply.";
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error calling Gemma API:", error.message);

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }

        res.status(500).json({ reply: "Something went wrong talking to the Gemma model." });
    }
});



app.get("/people", (req, res) => {
    res.render("people", { title: "Team" });
});

// Start Server
app.listen(3000);
console.log('Server is listening on port 3000');
