import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import { google }  from 'googleapis';
import cors from 'cors';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	process.env.REDIRECT_URI
);

const scopes = [
	'https://www.googleapis.com/auth/calendar.events'
]

const authorizationUrl = oauth2Client.generateAuthUrl({
	access_type: 'offline',
	scope: scopes,
	include_granted_scopes: true
});

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(cors())

app.get('/', (req: Request, res: Response) => {
	res.send('Welcome to Express & TypeScript Server');
});

app.get('/api/auth/google', (req: Request, res: Response) => {
	res.redirect(authorizationUrl);
})

app.get('/api/auth/google/callback', (req: Request, res: Response) => {
	const { code } = req.query;

	console.log(code)
	if (code) {
		oauth2Client.getToken(code.toString(), (err, token) => {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				return res.status(500).send('Error while trying to retrieve access token');
			}

			if (token) {
				oauth2Client.setCredentials(token);
				return res.status(200).send(token);
			}
		})
	}

	return res.status(400).send('Bad Request');
})

app.get('api/calendar/events', async (req: Request, res: Response) => {

});

app.listen(port, () => {
	console.log(`Server is Fire at http://localhost:${port}`);
});


