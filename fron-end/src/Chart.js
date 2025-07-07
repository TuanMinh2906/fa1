import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Select, MenuItem,
  Checkbox, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions,
  Divider, useMediaQuery, useTheme
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { EventNote, Category, BarChart } from '@mui/icons-material';

const Chart = ({ events = [], setEvents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Lấy dữ liệu từ API backend
  useEffect(() => {
    const fetchEvents = async () => {
      const calendarId = localStorage.getItem('calendarId');
      const token = localStorage.getItem('token');
      if (!calendarId || !token) return;

      try {
        const res = await fetch(`http://localhost:8003/api/calendar/${calendarId}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const mapped = data.map((note) => ({
          _id: note._id,
          title: note.title || 'Untitled',
          date: note.assignedDate,
          category: note.subject || 'General',
          // Các trường phía dưới có thể không có, xử lý mặc định
          description: note.description || '',
          location: note.location || '',
          attendees: note.attendees || '',
          reminder: note.reminder ?? 0,
          allDay: note.allDay ?? true,
          completed: note.completed ?? false,
        }));
        setEvents(mapped);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };
    fetchEvents();
  }, [setEvents]);

  const filteredEvents = events.filter((event) => {
    const hasRequiredFields = event.title && event.date;
    const matchesSearch = (event.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (event.category || '').toLowerCase() === categoryFilter.toLowerCase();
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
          <Typography variant="body2"><Category fontSize="small" /> {event.category}</Typography>
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
            <MenuItem value="all">📂 All categories</MenuItem>
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

      <Dialog open={!!modalEvent} onClose={() => setModalEvent(null)}>
        <DialogTitle>{modalEvent?.title}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom><strong>Date:</strong> {formatDisplayDate(modalEvent?.date)}</Typography>
          <Typography gutterBottom><strong>Description:</strong> {modalEvent?.description || 'No description'}</Typography>
          <Typography gutterBottom><strong>Category:</strong> {modalEvent?.category || 'None'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEvent(null)} variant="contained" color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chart;
