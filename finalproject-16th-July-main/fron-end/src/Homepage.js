import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Grid, Paper, Fade, CssBaseline
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function Homepage() {
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
        <CssBaseline />

        {/* Navbar */}
        <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              Planova
            </Typography>
            <Box>
              <Button color="inherit" onClick={handleLogin} sx={{ mr: 1 }}>Login</Button>
              <Button color="inherit" onClick={handleRegister}>Register</Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Hero Section */}
        <Container sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
            Welcome to Planova
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            A smart calendar app that helps you manage tasks, events, and time efficiently.
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={handleRegister}
            sx={{ px: 4, py: 1.5 }}
          >
            Get Started
          </Button>
        </Container>

        {/* Features Section */}
        <Container sx={{ py: 8 }}>
          <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
            Features
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <AccessTimeIcon fontSize="large" color="primary" />
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                  Smart Scheduling
                </Typography>
                <Typography color="text.secondary">
                  Plan your day with an intuitive calendar view.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <EventNoteIcon fontSize="large" color="primary" />
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                  Task Management
                </Typography>
                <Typography color="text.secondary">
                  Create, edit and track your daily events.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <BarChartIcon fontSize="large" color="primary" />
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                  Event Statistics
                </Typography>
                <Typography color="text.secondary">
                  Visualize your events with intuitive charts.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <PersonAddIcon fontSize="large" color="primary" />
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                  Post & Connect
                </Typography>
                <Typography color="text.secondary">
                  Share your status and connect with friends easily.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* CTA Section */}
        <Container sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Ready to boost your productivity?
          </Typography>
          <Button variant="outlined" size="large" onClick={handleLogin}>
            Login to Planova
          </Button>
        </Container>

        {/* Footer */}
        <Box sx={{ py: 3, backgroundColor: '#e3eaf1', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 Planova. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
}

export default Homepage;
