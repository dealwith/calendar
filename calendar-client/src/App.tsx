import { Box, Button, Container, Heading } from '@radix-ui/themes'
import axios from 'axios'
import './index.css'
import { useState, useEffect } from 'react';


function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Check if the URL has a code parameter
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Exchange the code for tokens
      axios.get(`http://localhost:8000/api/exchange-code?code=${code}`)
        .then(res => {
          fetchEvents();
        }).catch(err => console.error(err));
    }
  }, []);

  const fetchEvents = () => {
    axios.get('http://localhost:8000/calendar/events')
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => console.error(error));
  };

  const handleAuth = () => {
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  console.log(events);

  return (
    <Box width='100%' height='100%'>
      <Container size='4'>
        <Heading align='center' size='9'>Google Calendar</Heading>
        <Button onClick={handleAuth} mt='9' size='3'>Connect calendar</Button>
        <ul>
        {/* {events.map((event: { id: Key | null | undefined; summary: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; start: { dateTime: string | number | Date; }; }) => (
          <li key={event.id}>{event.summary} - {new Date(event.start.dateTime).toLocaleString()}</li>
        ))} */}
      </ul>
      </Container>
    </Box>
  )
}

export default App
