import express, {Request, Response} from 'express';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import {randomUUID} from 'node:crypto'
import cors from 'cors'

require('dotenv').config();

import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert("./serviceAccountKey.json")
});

const app = express();
const PORT = 8000;

app.use(cors())
app.use(express.json());
app.use(cookieParser());

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

google.options({ auth: oauth2Client });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/api/auth/google', (req: Request, res: Response) => {
	const url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: [
			"https://www.googleapis.com/auth/calendar.events"
			,"https://www.googleapis.com/auth/userinfo.email"
		]
	});

	res.redirect(url);
});

app.get('/api/auth/google/callback', async (req: Request , res: Response) => {
	const { code } = req.query;
	try {
		const { tokens } = await oauth2Client.getToken(code as string);
		oauth2Client.setCredentials(tokens);

		const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

		const sessionId = randomUUID();
		const userInfo = await oauth2.userinfo.get();
		const userEmail = userInfo.data.email;

		admin.firestore().collection("users").doc(userEmail as string).set({
			token: tokens.access_token,
			session_id: sessionId
		})

		res.cookie('session_id', sessionId, { httpOnly: false, secure: true });
		res.redirect(`http://localhost:5173`)
	} catch (error) {
		res.status(500).send('Authentication failed.');
	}
});

app.get('/api/calendar/events', async (req: Request, res: Response) => {
  try {
		const session_id = req.cookies.session_id;
		const user = await admin.firestore().collection("users").where("session_id", "==", session_id).get();

		if (user.empty) {
			res.status(401).send('Unauthorized');
			return;
		}

		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({
			access_token: user.docs[0].data().token
		});

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json(response.data.items);
  } catch (error) {
    res.status(500).send('Error retrieving calendar events.');
  }
});

app.post('/api/calendar/disconnect', async (req: Request, res: Response) => {
	try {
		const session_id = req.cookies.session_id;
		const user = await admin.firestore().collection("users").where("session_id", "==", session_id).get();

		if (user.empty) {
			res.status(401).send('Unauthorized');
			return;
		}

		await admin.firestore().collection("users").doc(user.docs[0].id).delete();
		res.cookie('session_id', '', { httpOnly: false, secure: true })
		res.status(200).send('OK');
	} catch (error) {
		res.status(500).send('Error disconnecting calendar.');
	}
})
