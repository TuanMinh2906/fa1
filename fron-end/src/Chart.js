import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Select, MenuItem,
  Checkbox, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions,
  Divider, useMediaQuery, useTheme
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { EventNote, Category, BarChart } from '@mui/icons-material';

const Chart = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      const calendarId = localStorage.getItem('calendarId');
      if (!token || !calendarId) return;

      try {
        const res = await fetch(`http://localhost:8003/api/calendar/${calendarId}/notes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        const mapped = data.map(note => {
          return {
            _id: note._id,
            title: note.title || 'Untitled',
            date: note.assignedDate,
            subject: note.subject || 'None',
            completed: note.isDone ?? false,
            contentBlocks: note.contentBlocks || [],
            reminder: note.reminder || 0,
            description: note.description || '',
            location: note.location || '',
            attendees: note.attendees || '',
            allDay: note.allDay || false,
          };
        });

        setEvents(mapped);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const hasRequiredFields = event.title && event.date;
    const matchesSearch = (event.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (event.subject || '').toLowerCase() === categoryFilter.toLowerCase();
    const notHiddenByCompleted = !hideCompleted || !event.completed;
    return hasRequiredFields && matchesSearch && matchesCategory && notHiddenByCompleted;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = filteredEvents.filter(e => new Date(e.date).toISOString().split('T')[0] === todayStr);
  const otherEvents = filteredEvents.filter(e => new Date(e.date).toISOString().split('T')[0] !== todayStr);

  const completedCount = events.filter(e => e.completed).length;
  const notCompletedCount = events.filter(e => !e.completed).length;
  const pieData = [
    { name: 'Completed', value: completedCount },
    { name: 'Not Completed', value: notCompletedCount },
  ];
  const pieColors = ['#1976d2', '#e53935'];

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
  };

  const renderEventRow = (event, index) => (
    <Paper key={index} sx={{
      p: 2, mb: 2,
      backgroundColor: event.completed ? '#e3f2fd' : '#fff',
      borderRadius: 2,
      boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
      borderLeft: `5px solid ${event.completed ? '#1976d2' : '#e53935'}`
    }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={1}>
          <Checkbox checked={event.completed} onChange={() => {
            const updated = [...events];
            updated[index].completed = !event.completed;
            setEvents(updated);
          }} />
        </Grid>
        <Grid item xs={10} sm={3}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventNote fontSize="small" /> {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">{formatDisplayDate(event.date)}</Typography>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Typography variant="body2"><Category fontSize="small" /> {event.subject}</Typography>
          {event.description && <Typography variant="body2">{event.description}</Typography>}
        </Grid>
        <Grid item xs={12} sm={3} display="flex" justifyContent={isMobile ? 'flex-start' : 'flex-end'} gap={1}>
          <Button variant="outlined" size="small" onClick={() => setModalEvent(event)}>View</Button>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box sx={{ pl: '80px', pr: 2, pt: 3, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, color: '#1976d2', fontWeight: 700 }}>
        <BarChart sx={{ mr: 1 }} /> Chart View
      </Typography>

      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} sm={4}>
          <Select fullWidth value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <MenuItem value="all">📂 All types</MenuItem>
            <MenuItem value="work">💼 Work</MenuItem>
            <MenuItem value="personal">🏡 Personal</MenuItem>
            <MenuItem value="meeting">🗓️ Meeting</MenuItem>
            <MenuItem value="birthday">🎉 Birthday</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth placeholder="🔍 Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button variant="contained" color="primary" fullWidth onClick={() => setHideCompleted(!hideCompleted)}>
            {hideCompleted ? '👁 Show Completed' : '🙈 Hide Completed'}
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center', mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>📈 Completion Ratio</Typography>
        <PieChart width={350} height={300}>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Box>

      <Divider textAlign="left" sx={{ mb: 2 }}>🔴 Today's Events</Divider>
      {todayEvents.map((event) => renderEventRow(event, events.indexOf(event)))}

      <Divider textAlign="left" sx={{ mt: 4, mb: 2 }}>📅 Other Events</Divider>
      {otherEvents.map((event) => renderEventRow(event, events.indexOf(event)))}

      <Dialog open={!!modalEvent} onClose={() => setModalEvent(null)} fullWidth maxWidth="sm">
        <DialogTitle>{modalEvent?.title}</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom><strong>Date:</strong> {formatDisplayDate(modalEvent?.date)}</Typography>
          <Typography gutterBottom><strong>Location:</strong> {modalEvent?.location || 'N/A'}</Typography>
          <Typography gutterBottom><strong>Attendees:</strong> {modalEvent?.attendees || 'None'}</Typography>
          <Typography gutterBottom><strong>Reminder:</strong> {modalEvent?.reminder} minutes</Typography>
          <Typography gutterBottom><strong>All Day:</strong> {modalEvent?.allDay ? 'Yes' : 'No'}</Typography>
          <Typography gutterBottom><strong>Task Type:</strong> {modalEvent?.subject || 'None'}</Typography>

          {modalEvent?.contentBlocks?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom><strong>Tasks:</strong></Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {modalEvent.contentBlocks.map((block, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      backgroundColor: '#f5f5f5',
                      borderLeft: '4px solid #1976d2',
                      borderRadius: 1,
                      padding: '8px 12px',
                      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                      fontSize: 14,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {block.data}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEvent(null)} variant="contained" color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chart;
