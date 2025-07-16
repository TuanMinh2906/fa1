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

  const handleDeletePost = async () => {
    try {
      const res = await fetch(`http://localhost:8003/api/posts/${selectedPostId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p._id !== selectedPostId));
      } else {
        console.error('Failed to delete post');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      handleMenuClose();
    }
  };

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
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
      } catch (err) {
        console.error('Error loading current user:', err);
        setError('Server error');
      }
    };

    fetchMyProfile();
  }, [token]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!token) return;
        const res = await fetch('http://localhost:8003/api/posts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error('Invalid posts response:', data);
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [token]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (tabIndex !== 1 || !token) return;

      try {
        const res = await fetch('http://localhost:8003/api/users/friends/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
          setFriends(data);
        } else {
          console.error('Failed to fetch friends:', data.message);
        }
      } catch (err) {
        console.error('Error fetching friends:', err);
      }
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

      const data = await res.json();

      if (res.ok) {
        setPostContent('');
        const updatedRes = await fetch('http://localhost:8003/api/posts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedPosts = await updatedRes.json();
        if (updatedRes.ok && Array.isArray(updatedPosts)) {
          setPosts(updatedPosts);
        } else {
          setPosts([]);
        }
      } else {
        console.error('Post error:', data.message);
      }
    } catch (err) {
      console.error('Post error:', err);
    }
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
              src={user.profilePicture?.[0] || ''}
              sx={{ width: 120, height: 120, border: '4px solid white' }}
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

      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mt: 3 }}>
        <Tab label="Posts" />
        <Tab label="Friends" />
        <Tab label="Projects" />
      </Tabs>

      {tabIndex === 0 && user && (
        <>
          <Grid container spacing={3} sx={{ mt: 2 }} alignItems="flex-start">
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Bio</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    From <strong>Hanoi, Viet Nam</strong>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={9}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                <Box display="flex" alignItems="flex-start">
                  <Avatar
                    src={user.profilePicture?.[0] || ''}
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
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
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

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {Array.isArray(posts) &&
              posts
                .filter((post) => post.user?._id === user._id)
                .map((post) => (
                  <Grid item xs={12} key={post._id}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box display="flex" alignItems="center">
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
                        {post.user?._id === user._id && (
                          <IconButton onClick={(e) => handleMenuOpen(e, post._id)}>
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </Box>

                      {editingPostId === post._id ? (
                        <>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                          />
                          <Box display="flex" justifyContent="flex-end" mt={1} gap={1}>
                            <Button
                              variant="outlined"
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
                                try {
                                  const res = await fetch(`http://localhost:8003/api/posts/${editingPostId}`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ content: editingContent })
                                  });

                                  if (res.ok) {
                                    const updatedPosts = posts.map(p =>
                                      p._id === editingPostId ? { ...p, content: editingContent } : p
                                    );
                                    setPosts(updatedPosts);
                                    setEditingPostId(null);
                                    setEditingContent('');
                                  } else {
                                    console.error('Failed to update post');
                                  }
                                } catch (err) {
                                  console.error('Edit error:', err);
                                }
                              }}
                            >
                              Save
                            </Button>
                          </Box>
                        </>
                      ) : (
                        <Typography>{post.content}</Typography>
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
                        }}>
                          Edit
                        </MenuItem>
                        <MenuItem onClick={handleDeletePost}>Delete</MenuItem>
                      </Menu>
                    </Paper>
                  </Grid>
                ))}
          </Grid>
        </>
      )}

      {tabIndex === 1 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {friends.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No friends yet.</Typography>
            </Grid>
          ) : (
            friends.map((friend) => (
              <Grid item xs={12} md={6} lg={4} key={friend._id}>
                <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <Avatar
                    src={friend.profilePicture?.[0] || ''}
                    alt={friend.userName}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {friend.userName}
                    </Typography>
                    <Typography variant="body2">{friend.email}</Typography>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
}

export default MyProfile;
