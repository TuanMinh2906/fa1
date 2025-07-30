const express = require('express');
const router = express.Router();
const handleGoogleLogin = require('../action/handleGoogleLogin');

router.post('/google', handleGoogleLogin);

module.exports = router;