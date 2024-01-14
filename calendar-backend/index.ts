import express, {Request, Response} from 'express';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';

require('dotenv').config();

const app = express();
const PORT = 8000;

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
		scope: ["https://www.googleapis.com/auth/calendar.events"]
	});

	res.redirect(url);
});

app.get('/api/auth/google/callback', async (req: Request , res: Response) => {
	const { code } = req.query;
	try {
		const response = await oauth2Client.getToken(code as string);
		const tokens = response.tokens;

		oauth2Client.setCredentials(tokens);
		res.redirect(`http://localhost:5173`)
	} catch (error) {
		res.status(500).send('Authentication failed.');
	}
});

app.get('/calendar/events', async (req: Request, res: Response) => {
  try {
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

app.get('/api/exchange-code', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);
    res.redirect('http://localhost:5173?success=true&authorized_token=fdfdasfsa');
  } catch (error) {
    res.status(500).send('Error during code exchange.');
  }
});
