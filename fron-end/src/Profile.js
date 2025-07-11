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
} from '@mui/material';
import { useParams } from 'react-router-dom';

function Profile() {
  const { userId } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8003/api/users/${userId}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    const checkIfFriend = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8003/api/users/friends/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const alreadyFriend = data.some(friend => String(friend._id) === String(userId));
        setIsFriend(alreadyFriend);
      } catch (err) {
        console.error('Failed to check friendship:', err);
      }
    };

    fetchUser();
    checkIfFriend();
  }, [userId]);

  const handleAddFriend = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8003/api/users/friends/request/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setIsRequestSent(true);
      } else {
        setError(result.message || 'Failed to send request');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8003/api/users/friends/unfriend/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok) {
        setIsFriend(false);         // Gỡ trạng thái bạn bè
        setIsRequestSent(false);    // Reset lại nếu trước đó từng gửi request
      } else {
        setError(result.message || 'Failed to unfriend');
      }
    } catch (err) {
      setError('Network error while unfriending');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <Typography>Loading profile...</Typography>;

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

      <Grid container spacing={2} sx={{ mt: -8, px: 2, alignItems: 'center' }}>
        <Grid item>
          <Avatar
            alt={user.userName}
            src={user.avatar || 'https://via.placeholder.com/120'}
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

          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            {isFriend && (
              <>
                <Button variant="contained" disabled>👥 Friend</Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleUnfriend}
                  disabled={isLoading}
                >
                  {isLoading ? 'Unfriending...' : '❌ Unfriend'}
                </Button>
              </>
            )}

            {!isFriend && (
              isRequestSent ? (
                <Button variant="outlined" disabled>✅ Request Sent</Button>
              ) : (
                <Button variant="outlined" onClick={handleAddFriend} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Add Friend'}
                </Button>
              )
            )}
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Grid>
      </Grid>

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
                src={user.avatar || 'https://via.placeholder.com/50'}
                sx={{ width: 50, height: 50, mr: 2 }}
              />
              <Box>
                <Typography fontWeight="bold">{user.userName}</Typography>
                <Typography variant="caption">At 9:52 AM 3/7/2025</Typography>
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

export default Profile;
