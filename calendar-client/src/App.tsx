import { Box, Button, Container, Flex, Heading } from '@radix-ui/themes'
import axios from 'axios'
import { useState, useEffect } from 'react';
import { GoogleEvents } from './Event';
import './index.css'

function App() {
  const [events, setEvents] = useState<GoogleEvents>([]);

  const fetchEvents = () => {
    return axios.get('/api/calendar/events', {withCredentials: true})
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => console.error(error));
  };

  useEffect(() => {
    fetchEvents()
  }, []);

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
        <Flex align='center' justify='center' mt='9' direction='column'>
          {!isEvents && <Button className='!cursor-pointer' onClick={connectCalendar} size='3'>Connect calendar ❤️</Button>}
          <ul className='mt-2'>
            {events.map(event => (
              <li key={event.id}>{event.summary} - {new Date(event.start.dateTime).toLocaleString()}</li>
            ))}
          </ul>
          {isEvents && <Button color='crimson' mt={"8"} className='!cursor-pointer' onClick={disconnectCalendar} size='3'>Disconnect calendar 😢</Button>}
        </Flex>
      </Container>
    </Box>
  )
}

export default App
