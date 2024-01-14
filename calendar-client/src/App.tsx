import { Box, Button, Container, Heading } from '@radix-ui/themes'
import axios from 'axios'
import { useState, useEffect } from 'react';
import { GoogleEvents } from './Event';
import './index.css'

function App() {
  const [events, setEvents] = useState<GoogleEvents>([]);

  useEffect(() => {
    fetchEvents()
  }, []);

  const fetchEvents = () => {
    return axios.get('api/calendar/events', {withCredentials: true})
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => console.error(error));
  };

  const connectCalendar = () => {
    window.location.href = '/api/auth/google';
  };

  const disconnectCalendar = async () => {
    const res = await axios.post('/api/calendar/disconnect')
    if (res.status === 200) {
      setEvents([]);
    }
  }

  const isEvents = events.length > 0;
  return (
    <Box width='100%' height='100%'>
      <Container size='4'>
        <Heading align='center' size='9'>Google Calendar</Heading>
        {isEvents
          ? <Button color='crimson' onClick={disconnectCalendar} mt='9' size='3'>Disconnect calendar</Button>
          : <Button onClick={connectCalendar} mt='9' size='3'>Connect calendar</Button>
        }
        <ul>
          {events.map(event => (
            <li key={event.id}>{event.summary} - {new Date(event.start.dateTime).toLocaleString()}</li>
          ))}
      </ul>
      </Container>
    </Box>
  )
}

export default App
