const express = require('express');
const app = express();
const handlebars = require("express-handlebars");
const Handlebars = require('handlebars');
const path = require('path');
const bodyParser = require('body-parser');

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
app.post("/chat", (req, res) => {
    const userMessage = req.body.message;
    

    const botReply = `You said: ${userMessage}`;
    
    res.json({ reply: botReply });
});

app.get("/people", (req, res) => {
    res.render("people", { title: "Team" });
});

// Start Server
app.listen(3000);
console.log('Server is listening on port 3000');
