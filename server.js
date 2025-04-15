import express from 'express';
import { Client } from '@gradio/client';
import expressHandlebars from 'express-handlebars';
import path from 'path';
import bodyParser from 'body-parser';
import axios from 'axios';
import { fileURLToPath } from 'url';

const app = express();

// Get the directory name from the URL of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

const hbs = expressHandlebars.create({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, '/views/layouts'),
    partialsDir: path.join(__dirname, '/views/partials'),
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


app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;  // Get user message from the request body

    try {
        // Connect to Gradio client and make a request to the Hugging Face Space API for your model
        const client = await Client.connect("made1570/TestingModelAPI");
        const result = await client.predict("/chat", { 
            message: userMessage, 
            system_message: "You are a friendly Chatbot.", 
            max_tokens: 512, 
            temperature: 0.7, 
            top_p: 0.95,
        });

        const botReply = result.data || "No reply."; // Get the response from Gradio model
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error calling HF API:", error.message);

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }

        res.status(500).json({ reply: "Something went wrong calling the model." });
    }
});

app.get("/people", (req, res) => {
    res.render("people", { title: "Team" });
});

// Start Server
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
