import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Tab,
  Tabs,
  Typography,
  Paper,
  TextField
} from '@mui/material';

function MyProfile() {
  const [tabIndex, setTabIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [postContent, setPostContent] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8003/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data);
        } else {
          setError(data.message || 'Failed to fetch user info');
        }
      } catch (err) {
        console.error('Error loading current user:', err);
        setError('Server error');
      }
    };

    fetchMyProfile();
  }, []);

  const handlePostSubmit = () => {
    if (!postContent.trim()) return;
    console.log("Post submitted:", postContent);
    setPostContent('');
    // TODO: Gửi nội dung lên backend sau
  };

  if (!user && !error) return <Typography>Loading profile...</Typography>;

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          position: 'relative',
          height: 220,
          backgroundImage: `url('https://source.unsplash.com/random/1920x300')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '0 0 16px 16px',
        }}
      />

      {user && (
        <Grid container spacing={2} sx={{ mt: -8, px: 2, alignItems: 'center' }}>
          <Grid item>
            <Avatar
              alt={user.userName}
              src={user.profilePicture || 'https://via.placeholder.com/120'}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
              }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" fontWeight="bold">
              {user.userName}
            </Typography>
            <Typography variant="body2">{user.email}</Typography>
          </Grid>
        </Grid>
      )}

      {error && (
        <Box mt={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Post Form */}
      {user && (
        <Paper elevation={3} sx={{ mt: 3, p: 2, borderRadius: 3 }}>
          <Box display="flex" alignItems="flex-start">
            <Avatar
              src={user.profilePicture || 'https://via.placeholder.com/50'}
              alt={user.userName}
              sx={{ width: 50, height: 50, mr: 2 }}
            />
            <Box flexGrow={1}>
              <TextField
                multiline
                fullWidth
                minRows={3}
                placeholder="Post your productivity and progress today :)"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                  }
                }}
              />
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button variant="contained" onClick={handlePostSubmit}>
                  Post
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mt: 3 }}>
        <Tab label="Posts" />
        <Tab label="Friends" />
        <Tab label="Projects" />
      </Tabs>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Bio</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                From <strong>Hanoi, Viet Nam</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                src={user?.profilePicture || 'https://via.placeholder.com/50'}
                sx={{ width: 50, height: 50, mr: 2 }}
              />
              <Box>
                <Typography fontWeight="bold">{user?.userName}</Typography>
                <Typography variant="caption">At {new Date().toLocaleString()}</Typography>
              </Box>
            </Box>
            <Typography>
              Hey I have found this calendar template is useful very much!
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default MyProfile;
