import express from 'express';
import { Client } from '@gradio/client';
import expressHandlebars from 'express-handlebars';
import path from 'path';
import bodyParser from 'body-parser';
import axios from 'axios';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.set("trust proxy", 1); // For secure cookies behind Render's proxy

// Directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup handlebars
const hbs = expressHandlebars.create({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, '/views/layouts'),
    partialsDir: path.join(__dirname, '/views/partials'),
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views/pages/'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(express.json());

// Setup session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS (e.g., Render + custom domain + SSL)
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    // Optional: Restrict users here
    // const allowedEmails = ["your@email.com"];
    // if (!allowedEmails.includes(profile.emails[0].value)) return done(null, false);
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Routes
app.get("/", (req, res) => {
    res.render("login", { title: "Login" });
});

app.get("/welcome", (req, res) => {
    res.render("welcome", { title: "Welcome", user: req.user  });
});

app.get("/chat", (req, res) => {
    if (!req.user) return res.redirect("/login");
    res.render("chat", { title: "Chat", user: req.user });
});

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    try {
        const client = await Client.connect("made1570/TestingModelAPI");
        const result = await client.predict("/predict", {
            user_input: userMessage,
        });

        const botReply = result.data[0];
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error using Gradio client:", error.message);
        res.status(500).json({ reply: "Failed to connect to model." });
    }
});

// 🔐 Google Auth Routes
app.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
        successRedirect: "/welcome"
    })
);

app.get("/logout", (req, res) => {
    req.logout(() => res.redirect("/"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
