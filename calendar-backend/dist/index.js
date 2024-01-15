"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const node_crypto_1 = require("node:crypto");
const cors_1 = __importDefault(require("cors"));
require('dotenv').config();
const firebase_admin_1 = __importDefault(require("firebase-admin"));
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert({
        projectId: process.env.SERVICE_ACCOUNT_PROJECT_ID,
        clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
        privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY
    }),
});
const app = (0, express_1.default)();
const PORT = 8000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
googleapis_1.google.options({ auth: oauth2Client });
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.get('/api/auth/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/userinfo.email"
        ]
    });
    res.redirect(url);
});
app.get('/api/auth/google/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    try {
        const { tokens } = yield oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        const oauth2 = googleapis_1.google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        const sessionId = (0, node_crypto_1.randomUUID)();
        const userInfo = yield oauth2.userinfo.get();
        const userEmail = userInfo.data.email;
        firebase_admin_1.default.firestore().collection("users").doc(userEmail).set({
            token: tokens.access_token,
            session_id: sessionId
        });
        res.cookie('session_id', sessionId, { httpOnly: false, secure: true });
        res.redirect(process.env.FRONTEND_URL);
    }
    catch (error) {
        res.status(500).send('Authentication failed.');
    }
}));
app.get('/api/calendar/events', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session_id = req.cookies.session_id;
        const user = yield firebase_admin_1.default.firestore().collection("users").where("session_id", "==", session_id).get();
        if (user.empty) {
            res.status(401).send('Unauthorized');
            return;
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2();
        oauth2Client.setCredentials({
            access_token: user.docs[0].data().token
        });
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        const response = yield calendar.events.list({
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        res.json(response.data.items);
    }
    catch (error) {
        res.status(500).send('Error retrieving calendar events.');
    }
}));
app.post('/api/calendar/disconnect', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session_id = req.cookies.session_id;
        const user = yield firebase_admin_1.default.firestore().collection("users").where("session_id", "==", session_id).get();
        if (user.empty) {
            res.status(401).send('Unauthorized');
            return;
        }
        yield firebase_admin_1.default.firestore().collection("users").doc(user.docs[0].id).delete();
        res.cookie('session_id', '', { httpOnly: false, secure: true });
        res.status(200).send('OK');
    }
    catch (error) {
        res.status(500).send('Error disconnecting calendar.');
    }
}));
