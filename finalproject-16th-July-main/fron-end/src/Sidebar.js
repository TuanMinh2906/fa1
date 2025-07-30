// Sidebar.jsx
import React, { useState } from 'react';
import {
  FaUser, FaSearch, FaUsers, FaBell,
  FaChartPie, FaCalendarAlt, FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Paper, Typography, Divider,
  Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Button,
  Menu, MenuItem, ListItemIcon, Avatar, Badge
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import PolicyIcon from '@mui/icons-material/Policy';
import Logout from '@mui/icons-material/Logout';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { motion, AnimatePresence } from 'framer-motion';

function Sidebar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openUserMenu = Boolean(anchorEl);
  const [selectedIconIndex, setSelectedIconIndex] = useState(null);
  const [showSearchType, setShowSearchType] = useState(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [requestCount, setRequestCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  const resetPanels = () => {
    setAnchorEl(null);
    setShowSearchType(null);
    setShowNotificationPanel(false);
  };

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8003/api/users/friends/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFriendRequests(data || []);
      setRequestCount(data.length);
    } catch (err) {
      console.error('Error fetching friend requests', err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const res = await fetch(`http://localhost:8003/api/users/${userId}`);
      const data = await res.json();
      setCurrentUser(data);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const handleBellClick = async () => {
    setShowSearchType(null);
    setShowNotificationPanel(!showNotificationPanel);
    await fetchFriendRequests();
  };

  const handleAccept = async (senderId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8003/api/users/friends/accept/${senderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriendRequests(prev => prev.filter(r => r._id !== senderId));
      setRequestCount(prev => prev - 1);
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleReject = async (senderId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8003/api/users/friends/reject/${senderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriendRequests(prev => prev.filter(r => r._id !== senderId));
      setRequestCount(prev => prev - 1);
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const icons = [
    {
      icon: FaUser,
      action: async (e) => {
        setAnchorEl(e.currentTarget);
        await fetchCurrentUser();
      }
    },
    {
      icon: FaSearch,
      action: () => {
        setShowSearchType(showSearchType === 'general' ? null : 'general');
        setQuery('');
        setSearchResults([]);
      }
    },
    {
      icon: FaUsers,
      action: () => {
        setShowSearchType(showSearchType === 'friends' ? null : 'friends');
        setQuery('');
        setSearchResults([]);
      }
    },
    { icon: FaBell, action: handleBellClick },
    { icon: FaChartPie, route: '/chart' },
    { icon: Diversity3Icon, route: '/group' }, // Đã đổi từ FaStickyNote sang Diversity3Icon
    { icon: FaCalendarAlt, route: '/calendar' }
  ];

  const getNoteMatches = async (queryText) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return [];

      const calendarRes = await fetch(`http://localhost:8003/api/calendar/user/${userId}`);
      const { calendarId } = await calendarRes.json();
      if (!calendarId) return [];

      const notesRes = await fetch(`http://localhost:8003/api/calendar/${calendarId}/notes`);
      const notes = await notesRes.json();

      return notes
        .filter(note => note.title.toLowerCase().includes(queryText.toLowerCase()))
        .map(note => ({
          type: 'note',
          _id: note._id,
          name: note.title,
          date: new Date(note.assignedDate).toLocaleDateString('vi-VN')
        }));
    } catch (err) {
      console.error('Error fetching notes:', err);
      return [];
    }
  };

  const getUserMatches = async (queryText) => {
    try {
      const userRes = await fetch('http://localhost:8003/api/users');
      const users = await userRes.json();
      return users
        .filter(user => user.userName.toLowerCase().includes(queryText.toLowerCase()))
        .map(user => ({ type: 'user', ...user }));
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  };

  const getFriendMatches = async (queryText) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8003/api/users/friends/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const friends = await res.json();
      return friends
        .filter(friend => friend.userName.toLowerCase().includes(queryText.toLowerCase()))
        .map(friend => ({ type: 'user', ...friend }));
    } catch (err) {
      console.error('Error fetching friends:', err);
      return [];
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim() === '') return setSearchResults([]);

    if (showSearchType === 'general') {
      const [notes, users] = await Promise.all([
        getNoteMatches(value),
        getUserMatches(value)
      ]);
      setSearchResults([...notes, ...users]);
    } else if (showSearchType === 'friends') {
      const friends = await getFriendMatches(value);
      setSearchResults(friends);
    }
  };

  const handleLogout = () => setOpenLogoutConfirm(true);
  const confirmLogout = () => {
    setOpenLogoutConfirm(false);
    localStorage.clear();
    navigate('/home');
  };
  const cancelLogout = () => setOpenLogoutConfirm(false);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Box sx={{
          position: 'fixed', top: 0, left: 0, width: '60px', height: '100vh',
          bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', alignItems: 'center', pt: 2, pb: 2,
          boxShadow: 2, zIndex: 1000
        }}>
          <Box>
            {icons.map(({ icon: Icon, route, action }, index) => (
              <motion.div
                key={index}
                onClick={async (e) => {
                resetPanels();
                setSelectedIconIndex(index);
                if (action) await action(e);

                if (route && route !== window.location.pathname) {
                navigate(route);
                }
              }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  margin: '12px 0',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#333',
                  backgroundColor: selectedIconIndex === index ? '#e0e0e0' : 'transparent',
                  borderRadius: 10,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderLeft: selectedIconIndex === index ? '4px solid #1976d2' : '4px solid transparent'
                }}
              >
                {Icon === FaBell ? (
                  <Badge badgeContent={requestCount} color="error">
                    <Icon />
                  </Badge>
                ) : (
                  <Icon />
                )}
              </motion.div>
            ))}
          </Box>

          <Box onClick={handleLogout} sx={{
            fontSize: 24, cursor: 'pointer', color: '#e53935', mb: 3,
            '&:hover': { color: '#c62828' }
          }}>
            <FaSignOutAlt />
          </Box>
        </Box>

        {/* Panels */}
        <AnimatePresence>
  {showSearchType && (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ position: 'absolute', top: '20px', left: '70px', zIndex: 1100 }}
    >
      <Paper elevation={3} sx={{ p: 2, width: 300 }}>
        <Typography variant="h6" gutterBottom>
          {showSearchType === 'general' ? 'Search Notes & Users' : 'Search Friends'}
        </Typography>
        <TextField
          label="Search..."
          fullWidth
          value={query}
          onChange={handleSearch}
          variant="outlined"
          size="small"
        />
        <Divider sx={{ my: 2 }} />
        {searchResults.length > 0 ? (
          searchResults.map((item, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              {item.type === 'note' && (
                <Typography variant="body2">📝 {item.name} - {item.date}</Typography>
              )}
              {item.type === 'user' && (
                <Box
                  sx={{ cursor: 'pointer', '&:hover': { color: '#1976d2', textDecoration: 'underline' } }}
                  onClick={() => navigate(`/profile/${item._id}`)}
                >
                  <Typography variant="body2">👤 {item.userName} ({item.email})</Typography>
                </Box>
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">No results found.</Typography>
        )}
      </Paper>
    </motion.div>
  )}

  {showNotificationPanel && (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ position: 'absolute', top: '20px', left: '70px', zIndex: 1100 }}
    >
      <Paper elevation={3} sx={{ p: 2, width: 300 }}>
        <Typography variant="h6" gutterBottom>Friend Requests</Typography>
        <Divider sx={{ mb: 1 }} />
        {friendRequests.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No friend requests</Typography>
        ) : (
          friendRequests.map(user => (
            <Box key={user._id} display="flex" alignItems="center" mb={1}>
              <Avatar src={user.profilePicture || 'https://via.placeholder.com/40'} sx={{ mr: 1 }} />
              <Box flexGrow={1}>
                <Typography>{user.userName}</Typography>
                <Typography variant="caption">{user.email}</Typography>
              </Box>
              <Button size="small" onClick={() => handleAccept(user._id)}>Accept</Button>
              <Button size="small" color="error" onClick={() => handleReject(user._id)}>Reject</Button>
            </Box>
          ))
        )}
      </Paper>
    </motion.div>
  )}
</AnimatePresence>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={openUserMenu}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 230, borderRadius: 2 } }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">{currentUser?.userName || 'User Name'}</Typography>
          <Typography variant="body2" color="text.secondary">{currentUser?.email || 'user@example.com'}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/me'); }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem>
          <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
          Settings & Preferences
        </MenuItem>
        <MenuItem>
          <ListItemIcon><FeedbackIcon fontSize="small" /></ListItemIcon>
          Give Feedback
        </MenuItem>
        <MenuItem>
          <ListItemIcon><PolicyIcon fontSize="small" /></ListItemIcon>
          Term and Policy
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout fontSize="small" sx={{ color: 'red' }} /></ListItemIcon>
          <Typography color="error">Log out</Typography>
        </MenuItem>
      </Menu>

      <Dialog open={openLogoutConfirm} onClose={cancelLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Do you want to Log Out?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout}>No</Button>
          <Button onClick={confirmLogout} color="error">Log Out</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Sidebar;
