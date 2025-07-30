import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Button, Avatar, Typography, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

function GoogleLoginGemini() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send access token to backend to authenticate and generate JWT
        const backendRes = await axios.post('http://localhost:8003/api/auth/google', {
          access_token: tokenResponse.access_token,
        });

        const { token, userId, calendarId } = backendRes.data;

        // Store JWT and user info in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('calendarId', calendarId);

        // Optional: fetch and show user profile info from Google
        const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const { name, email, picture } = userRes.data;

        setUserInfo({
          name,
          email,
          picture,
        });

        console.log('✅ Google login successful');
        navigate('/calendar');
      } catch (err) {
        console.error('❌ Google login failed:', err);
        alert('Google login failed. Please try again.');
      }
    },
    onError: () => {
      console.log('❌ Google login failed');
      alert('Google login failed. Please try again.');
    },
    scope: 'openid email profile',
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Button
        onClick={login}
        startIcon={<GoogleIcon />}
        variant="contained"
        sx={{
          backgroundColor: '#db4437',
          '&:hover': {
            backgroundColor: '#c33d2e',
          },
          color: '#fff',
          fontWeight: 600,
          borderRadius: 2,
          textTransform: 'none',
          px: 3,
          py: 1.2,
        }}
      >
        Login with Google
      </Button>

      {userInfo && (
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          mt={2}
          p={2}
          bgcolor="rgba(240,240,240,0.85)"
          borderRadius={2}
        >
          <Avatar alt={userInfo.name} src={userInfo.picture} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {userInfo.name}
            </Typography>
            <Typography variant="body2">{userInfo.email}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default GoogleLoginGemini;
