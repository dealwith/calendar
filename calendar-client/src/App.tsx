import { Box, Button, Container, Flex, Heading, Strong } from '@radix-ui/themes'
import axios from 'axios'
import { useState, useEffect } from 'react';
import { GoogleEvent, GoogleEvents } from './interfaces/Event';
import { parseAttendees } from './utils/parseAttendees';
import { EventDetailModal } from './components/EventModal';

import './index.css'


function App() {
  const [events, setEvents] = useState<GoogleEvents>([]);
  const [currentEvent, setCurrentEvent] = useState<GoogleEvent | null>(null);

  const fetchEvents = () => {
    return axios.get(`/api/calendar/events`, {withCredentials: true})
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => console.error(error));
  };

  useEffect(() => {
    fetchEvents()
  }, []);

  const connectCalendar = () => {
    window.location.href = `/api/auth/google`;
  };

  const disconnectCalendar = async () => {
    const res = await axios.post(`/api/calendar/disconnect`)
    if (res.status === 200) {
      setEvents([]);
    }
  }

  const isEvents = events.length > 0;
  const handleMoreDetailsClick = (event: GoogleEvent) => {
    setCurrentEvent(event);
  }
  const handleCloseModal = () => setCurrentEvent(null);

  return (
    <Box width='100%' height='100%'>
      <Container pb={"5"} size='4'>
        <Heading align='center' size='9'>Google Calendar</Heading>
        <Flex align='center' justify='center' mt='9' direction='column'>
          {!isEvents && <Button className='!cursor-pointer' onClick={connectCalendar} size='3'>Connect calendar ❤️</Button>}
          <ul className='mt-2'>
            {events.map((event, i) => (
              <li className='mb-3' key={event.id}>
                <div className='flex'>
                  <div>
                    <Strong>Event #{i+1}</Strong>
                    &nbsp;
                    {event.summary} - {new Date(event.start.dateTime).toLocaleString()}
                    {event.location && <>&nbsp;-&nbsp;{event.location}</>}
                    <br/>
                    {parseAttendees(event.attendees)}
                    {event.attendees && event?.attendees?.length > 0 && <br/>}
                  </div>
                  <Button ml={"2"} onClick={() => handleMoreDetailsClick(event)}>
                    More details
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {isEvents && <Button color='crimson' mt={"8"} className='!cursor-pointer' onClick={disconnectCalendar} size='3'>Disconnect calendar 😢</Button>}
          <EventDetailModal event={currentEvent} handleCloseModal={handleCloseModal} />
        </Flex>
      </Container>
    </Box>
  )
}

export default App
