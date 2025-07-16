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
  TextField,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function MyProfile() {
  const [tabIndex, setTabIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const [friendMenuAnchorEl, setFriendMenuAnchorEl] = useState(null);
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  const token = localStorage.getItem('token');

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  const handleFriendMenuOpen = (event, friendId) => {
    setFriendMenuAnchorEl(event.currentTarget);
    setSelectedFriendId(friendId);
  };

  const handleFriendMenuClose = () => {
    setFriendMenuAnchorEl(null);
    setSelectedFriendId(null);
  };

  const handleDeletePost = async () => {
    try {
      const res = await fetch(`http://localhost:8003/api/posts/${selectedPostId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(posts.filter((p) => p._id !== selectedPostId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      handleMenuClose();
    }
  };

  const handleUnfriend = async () => {
    try {
      const res = await fetch(`http://localhost:8003/api/users/friends/unfriend/${selectedFriendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFriends(friends.filter((f) => f._id !== selectedFriendId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      handleFriendMenuClose();
    }
  };

  useEffect(() => {
    const fetchMyProfile = async () => {
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        setError('Missing token or user ID');
        return;
      }
      const res = await fetch(`http://localhost:8003/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      } else {
        setError(data.message || 'Failed to fetch user info');
      }
    };
    fetchMyProfile();
  }, [token]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!token) return;
      const res = await fetch('http://localhost:8003/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setPosts(data);
    };
    fetchPosts();
  }, [token]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (tabIndex !== 1 || !token) return;
      const res = await fetch('http://localhost:8003/api/users/friends/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setFriends(data);
    };
    fetchFriends();
  }, [tabIndex, token]);

  const handlePostSubmit = async () => {
    if (!postContent.trim()) return;
    try {
      const res = await fetch('http://localhost:8003/api/posts/createpost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: postContent })
      });
      if (res.ok) {
        setPostContent('');
        const updatedRes = await fetch('http://localhost:8003/api/posts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedPosts = await updatedRes.json();
        if (updatedRes.ok) setPosts(updatedPosts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user && !error) return <Typography>Loading profile...</Typography>;

  return (
    <Container maxWidth="lg">
      {/* Background header */}
      <Box
        sx={{
          position: 'relative',
          height: 220,
          backgroundImage: `url('https://source.unsplash.com/1600x400/?workspace')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '0 0 20px 20px',
        }}
      />

      {/* User Info */}
      {user && (
        <Card
          sx={{
            mt: -8,
            p: 3,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 3,
            boxShadow: 4,
            backgroundColor: 'white',
          }}
        >
          <Avatar
            alt={user.userName}
            src={user.profilePicture?.[0] || ''}
            sx={{ width: 100, height: 100, mr: 3, border: '3px solid #1976d2' }}
          />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {user.userName}
            </Typography>
            <Typography color="text.secondary">{user.email}</Typography>
          </Box>
        </Card>
      )}

      {error && (
        <Box mt={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        sx={{ mt: 4 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Posts" />
        <Tab label="Friends" />
        <Tab label="Projects" />
      </Tabs>

      {/* Posts */}
      {tabIndex === 0 && (
        <>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ backgroundColor: '#f5f5f5', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    🧾 Bio
                  </Typography>
                  <Typography variant="body2">
                    📍 From <strong>Hanoi, Viet Nam</strong>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={9}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex">
                  <Avatar
                    src={user.profilePicture?.[0] || ''}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  />
                  <Box flexGrow={1}>
                    <TextField
                      multiline
                      fullWidth
                      minRows={3}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share what you're up to today..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Box display="flex" justifyContent="flex-end" mt={1}>
                      <Button variant="contained" onClick={handlePostSubmit}>
                        Post
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Post list */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {posts.filter((post) => post.user?._id === user._id).map((post) => (
              <Grid item xs={12} key={post._id}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'scale(1.01)',
                      transition: '0.2s ease-in-out',
                    },
                  }}
                >
                  <Box display="flex" justifyContent="space-between">
                    <Box display="flex">
                      <Avatar
                        src={post.user?.profilePicture || ''}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      />
                      <Box>
                        <Typography fontWeight="bold">{post.user?.userName}</Typography>
                        <Typography variant="caption">
                          At {new Date(post.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton onClick={(e) => handleMenuOpen(e, post._id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {editingPostId === post._id ? (
                    <>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        sx={{ mt: 2 }}
                      />
                      <Box display="flex" justifyContent="flex-end" mt={1} gap={1}>
                        <Button
                          onClick={() => {
                            setEditingPostId(null);
                            setEditingContent('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={async () => {
                            const res = await fetch(`http://localhost:8003/api/posts/${editingPostId}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify({ content: editingContent })
                            });
                            if (res.ok) {
                              const updated = posts.map(p =>
                                p._id === editingPostId ? { ...p, content: editingContent } : p
                              );
                              setPosts(updated);
                              setEditingPostId(null);
                              setEditingContent('');
                            }
                          }}
                        >
                          Save
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Typography mt={2}>{post.content}</Typography>
                  )}

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl && selectedPostId === post._id)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => {
                      setEditingPostId(post._id);
                      setEditingContent(post.content);
                      handleMenuClose();
                    }}>Edit</MenuItem>
                    <MenuItem onClick={handleDeletePost}>Delete</MenuItem>
                  </Menu>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Friends */}
      {tabIndex === 1 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {friends.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No friends yet.</Typography>
            </Grid>
          ) : (
            friends.map((friend) => (
              <Grid item xs={12} md={6} lg={4} key={friend._id}>
                <Card sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center">
                    <Avatar src={friend.profilePicture?.[0] || ''} sx={{ mr: 2 }} />
                    <Box>
                      <Typography fontWeight="bold">{friend.userName}</Typography>
                      <Typography variant="body2">{friend.email}</Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={(e) => handleFriendMenuOpen(e, friend._id)}>
                    <MoreVertIcon />
                  </IconButton>
                </Card>

                <Menu
                  anchorEl={friendMenuAnchorEl}
                  open={Boolean(friendMenuAnchorEl) && selectedFriendId === friend._id}
                  onClose={handleFriendMenuClose}
                >
                  <MenuItem onClick={handleUnfriend}>❌ Unfriend</MenuItem>
                </Menu>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Projects */}
      {tabIndex === 2 && (
        <Box mt={4}>
          <Typography variant="h6">🚧 Projects will be shown here in the future.</Typography>
        </Box>
      )}
    </Container>
  );
}

export default MyProfile;
