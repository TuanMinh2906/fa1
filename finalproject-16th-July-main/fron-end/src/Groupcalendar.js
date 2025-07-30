import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function GroupCalendar() {
  const [events, setEvents] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const navigate = useNavigate();

  const handleGoToAddEvent = () => {
    navigate('/add-event');
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setNewEventTitle('');
    setOpenAdd(true);
  };

  const handleAddEvent = () => {
    if (newEventTitle.trim()) {
      setEvents([...events, { title: newEventTitle, date: selectedDate }]);
    }
    setOpenAdd(false);
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setOpenDetail(true);
  };

  const handleDeleteEvent = () => {
    setEvents(events.filter(
      (e) => !(e.title === selectedEvent.title && e.date === selectedEvent.startStr)
    ));
    setOpenDetail(false);
  };

  return (
    <Box
      sx={{
        p: 3,
        ml: '70px',
        pr: 3,
        minHeight: '100vh',
        backgroundColor: '#fff',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
        Group Calendar
      </Typography>

      {/* Nút chuyển đến Add Group Event */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoToAddEvent}
        >
          Add Group Event
        </Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2, minHeight: '600px' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={handleDateClick}
          events={events}
          eventClick={handleEventClick}
          displayEventTime={false}
          height="auto"
        />
      </Paper>

      {/* Dialog: Add Event */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add Event</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Event Title"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            autoFocus
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAddEvent} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Event Details */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)}>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          <Typography><strong>Title:</strong> {selectedEvent?.title}</Typography>
          <Typography><strong>Date:</strong> {selectedEvent?.startStr}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Close</Button>
          <Button onClick={handleDeleteEvent} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GroupCalendar;
