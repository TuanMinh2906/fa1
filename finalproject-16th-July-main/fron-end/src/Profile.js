import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Tab,
  Tabs,
  Typography,
  Divider,
} from '@mui/material';
import { useParams } from 'react-router-dom';

function Profile() {
  const { userId } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    // ✅ Reset state khi userId thay đổi
    setIsFriend(false);
    setIsRequestSent(false);
    setIsLoading(false);
    setError('');
    setPosts([]);
    setUser(null);

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

    const fetchUserPosts = async () => {
      try {
        const res = await fetch(`http://localhost:8003/api/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          const filtered = data.filter(post => post.user?._id === userId);
          setPosts(filtered);
        } else {
          console.error('Failed to fetch posts');
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      }
    };

    fetchUser();
    checkIfFriend();
    fetchUserPosts();
  }, [userId, token]);

  const handleAddFriend = async () => {
    try {
      setIsLoading(true);
      setError('');
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
      const res = await fetch(`http://localhost:8003/api/users/friends/unfriend/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok) {
        setIsFriend(false);
        setIsRequestSent(false);
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
    <Box sx={{ bgcolor: '#f3f6f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            src={user.profilePicture?.[0] || 'https://via.placeholder.com/120'}
            sx={{
              width: 100,
              height: 100,
              margin: '0 auto',
              border: '4px solid #42a5f5',
              bgcolor: '#e3f2fd',
            }}
          />
          <Typography variant="h5" mt={2}>{user.userName}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
            {isFriend ? (
              <>
                <Button variant="contained" disabled>👥 Friend</Button>
                <Button variant="outlined" color="error" onClick={handleUnfriend} disabled={isLoading}>
                  {isLoading ? 'Unfriending...' : '❌ Unfriend'}
                </Button>
              </>
            ) : isRequestSent ? (
              <Button variant="outlined" disabled>✅ Request Sent</Button>
            ) : (
              <Button variant="outlined" onClick={handleAddFriend} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Add Friend'}
              </Button>
            )}
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>

        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': { fontWeight: 'bold' },
            '& .Mui-selected': { color: '#1976d2 !important' }
          }}
        >
          <Tab label="Posts" />
          <Tab label="Friends" />
          <Tab label="Projects" />
        </Tabs>

        <Divider sx={{ my: 2 }} />

        {tabIndex === 0 && (
          <Box mt={2}>
            {posts.length === 0 ? (
              <Typography>No posts yet.</Typography>
            ) : (
              posts.map(post => (
                <Card
                  key={post._id}
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    boxShadow: 1,
                    transition: '0.3s',
                    '&:hover': {
                      boxShadow: 5,
                      transform: 'scale(1.01)',
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar src={user.profilePicture?.[0]} sx={{ mr: 2 }} />
                      <Box>
                        <Typography fontWeight="bold">{user.userName}</Typography>
                        <Typography variant="caption">
                          {new Date(post.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography mt={2}>{post.content}</Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}

        {tabIndex === 1 && (
          <Box textAlign="center" mt={4}>
            <Typography variant="body1">🚧 Friends will be shown here in the future.</Typography>
          </Box>
        )}

        {tabIndex === 2 && (
          <Box textAlign="center" mt={4}>
            <Typography variant="body1">🚧 Projects will be shown here in the future.</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Profile;
