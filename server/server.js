const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");

// It is temporary. it used for making date and time for google meet in the backend
//  but it will come later from front.
const dayjs = require("dayjs");

// Making random and uniq id for google meet.
const uuid = require("uuid").v4

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());


// connect to the application of google console
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'openid',
  'email',
  'profile'
];

// const calendar = google.calendar({
//   version: 'v3',
//   auth: process.env.API_KEY
// });


// Get the url of login page from google auth
app.get("/login", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes
  })
  res.status(200).json(url);
});


// Get token then get all information such as email,profile... which we add them in the scope
app.get("/login/redirect", async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Error fetching');
    }
    const userInfo = await response.json();
    res.status(200).json({ userInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching' });
  }
});


// Access to the Calendar Api, insert an event and create a google meet link
// The method should change to POST and get date and time from query according by customer choose it
app.get("/create-event", async (req, res) => {
  try {
    const calendar = google.calendar('v3');
    const response = await calendar.events.insert({
      auth: oauth2Client,
      conferenceDataVersion: 1,
      calendarId: 'primary',
      requestBody: {
        // description: description,
        description: "important event",
        start: {
          // dateTime: new Date(startDateTime),
          dateTime: dayjs(new Date()).add(1, "day").toISOString(),
          timeZone: "Europe/London"
        },
        end: {
          // dateTime: new Date(endDateTime),
          dateTime: dayjs(new Date()).add(1, "day").add(1, "hour").toISOString(),
          timeZone: "Europe/London"
        },
        conferenceData: {
          createRequest: {
            requestId: uuid()
          }
        },
        attendees: [{
          email: "farzaneh.haghani@gmail.com"
        }]
      },
    }, { responseType: 'json' });
    res.json(response);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching' });
  }
});


const PORT = process.env.PORT ?? 3030
app.listen(PORT, () => {
  console.log("run in port 3030")
})