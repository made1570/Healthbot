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
    const userMessage = req.body.message;
  
    try {
      // Connect to your HF Space
      const client = await Client.connect("made1570/TestingModelAPI");
  
      // Predict using the Space's `/predict` endpoint
      const result = await client.predict("/predict", {
        user_input: userMessage, // Match the input key name used in your Gradio app
      });
  
      // Extract and send the reply
      const botReply = result.data[0];
      res.json({ reply: botReply });
  
    } catch (error) {
      console.error("Error using Gradio client:", error.message);
      res.status(500).json({ reply: "Failed to connect to model." });
    }
  });

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});