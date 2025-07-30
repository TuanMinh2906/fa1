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
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Divider
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

  const handleTabChange = (event, newValue) => setTabIndex(newValue);
  const handleMenuOpen = (e, postId) => { setAnchorEl(e.currentTarget); setSelectedPostId(postId); };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedPostId(null); };
  const handleFriendMenuOpen = (e, id) => { setFriendMenuAnchorEl(e.currentTarget); setSelectedFriendId(id); };
  const handleFriendMenuClose = () => { setFriendMenuAnchorEl(null); setSelectedFriendId(null); };

  const handleDeletePost = async () => {
    try {
      const res = await fetch(`http://localhost:8003/api/posts/${selectedPostId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setPosts(posts.filter(p => p._id !== selectedPostId));
    } catch (err) {
      console.error(err);
    } finally {
      handleMenuClose();
    }
  };

  const handleUnfriend = async () => {
    try {
      const res = await fetch(`http://localhost:8003/api/users/friends/unfriend/${selectedFriendId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setFriends(friends.filter(f => f._id !== selectedFriendId));
    } catch (err) {
      console.error(err);
    } finally {
      handleFriendMenuClose();
    }
  };

  useEffect(() => {
    const fetchMyProfile = async () => {
      const userId = localStorage.getItem('userId');
      if (!token || !userId) return setError('Missing token or user ID');
      const res = await fetch(`http://localhost:8003/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setUser(data);
      else setError(data.message || 'Failed to fetch user info');
    };
    fetchMyProfile();
  }, [token]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!token) return;
      const res = await fetch('http://localhost:8003/api/posts', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setPosts(data);
    };
    fetchPosts();
  }, [token]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (tabIndex !== 1 || !token) return;
      const res = await fetch('http://localhost:8003/api/users/friends/list', { headers: { Authorization: `Bearer ${token}` } });
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: postContent })
      });
      if (res.ok) {
        setPostContent('');
        const updated = await fetch('http://localhost:8003/api/posts', { headers: { Authorization: `Bearer ${token}` } });
        const updatedPosts = await updated.json();
        if (updated.ok) setPosts(updatedPosts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user && !error) return <Typography>Loading profile...</Typography>;

  return (
    <Box sx={{ bgcolor: '#f3f6f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            src={user?.profilePicture?.[0]}
            sx={{
              width: 100, height: 100, margin: '0 auto',
              border: '4px solid #42a5f5', bgcolor: '#e3f2fd'
            }}
          />
          <Typography variant="h5" mt={2}>{user?.userName}</Typography>
          <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
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
          <Box>
            <TextField
              multiline fullWidth minRows={3}
              placeholder="Share what you're up to today..."
              value={postContent} onChange={(e) => setPostContent(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box textAlign="right">
              <Button
                variant="contained"
                sx={{
                  borderRadius: 10,
                  textTransform: 'none',
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
                onClick={handlePostSubmit}
              >
                Post
              </Button>
            </Box>

            <Box mt={4}>
              {posts.filter(p => p.user?._id === user._id).map((post) => (
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
                    <Box display="flex" justifyContent="space-between">
                      <Box display="flex">
                        <Avatar src={post.user?.profilePicture || ''} sx={{ mr: 2 }} />
                        <Box>
                          <Typography fontWeight="bold">{post.user?.userName}</Typography>
                          <Typography variant="caption">{new Date(post.createdAt).toLocaleString()}</Typography>
                        </Box>
                      </Box>
                      <IconButton onClick={(e) => handleMenuOpen(e, post._id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    {editingPostId === post._id ? (
                      <Box mt={2}>
                        <TextField
                          fullWidth multiline minRows={2}
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                        />
                        <Box textAlign="right" mt={1}>
                          <Button onClick={() => { setEditingPostId(null); setEditingContent(''); }}>Cancel</Button>
                          <Button
                            variant="contained"
                            onClick={async () => {
                              const res = await fetch(`http://localhost:8003/api/posts/${editingPostId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ content: editingContent })
                              });
                              if (res.ok) {
                                const updated = posts.map(p => p._id === editingPostId ? { ...p, content: editingContent } : p);
                                setPosts(updated);
                                setEditingPostId(null);
                                setEditingContent('');
                              }
                            }}
                          >Save</Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography mt={2}>{post.content}</Typography>
                    )}

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl && selectedPostId === post._id)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => { setEditingPostId(post._id); setEditingContent(post.content); handleMenuClose(); }}>Edit</MenuItem>
                      <MenuItem onClick={handleDeletePost}>Delete</MenuItem>
                    </Menu>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {tabIndex === 1 && (
          <Grid container spacing={2}>
            {friends.length === 0 ? (
              <Grid item xs={12}><Typography>No friends yet.</Typography></Grid>
            ) : (
              friends.map(friend => (
                <Grid item xs={12} sm={6} key={friend._id}>
                  <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                    <Box display="flex" alignItems="center">
                      <Avatar src={friend.profilePicture?.[0]} sx={{ mr: 2 }} />
                      <Box>
                        <Typography fontWeight="bold">{friend.userName}</Typography>
                        <Typography variant="body2" color="text.secondary">{friend.email}</Typography>
                      </Box>
                    </Box>
                    <IconButton onClick={(e) => handleFriendMenuOpen(e, friend._id)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={friendMenuAnchorEl}
                      open={Boolean(friendMenuAnchorEl) && selectedFriendId === friend._id}
                      onClose={handleFriendMenuClose}
                    >
                      <MenuItem onClick={handleUnfriend}>Unfriend</MenuItem>
                    </Menu>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {tabIndex === 2 && (
          <Box mt={4} textAlign="center">
            <Typography variant="body1">🚧 Projects will be shown here in the future.</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default MyProfile;
