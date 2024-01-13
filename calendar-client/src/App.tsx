import { Box, Button, Container, Heading } from '@radix-ui/themes'
import './index.css'


function App() {
  return (
    <Box width='100%' height='100%'>
      <Container size='4'>
        <Heading align='center' size='9'>Google Calendar</Heading>
        <Button mt='9' size='3'>Connect calendar</Button>
      </Container>
    </Box>
  )
}

export default App
