const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../schema/userSchema');
const Calendar = require('../schema/calendarSchema');

const secret = process.env.JWT_SECRET || 'your-secret-key';

const handleGoogleLogin = async (req, res) => {
    const { access_token } = req.body;
    if (!access_token)
        return res.status(400).json({ error: 'Missing Google access token' });

    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
    });

    const { email, name, picture } = response.data;

    let user = await User.findOne({ email });

    if (!user) {
        // Tạo user mới
        user = new User({ userName: name, email, profilePicture: picture, provider: 'google' });
        await user.save();

        // Tạo calendar mặc định
        const newCalendar = new Calendar({
            title: `${name}'s Calendar`,
            description: `Default calendar for ${name}`,
            userId: user._id
        });
        await newCalendar.save();

        user.calendarId = newCalendar._id;
        await user.save();
    }

    // Tạo token
    const token = jwt.sign(
        { id: user._id, email: user.email, userName: user.userName },
        secret,
        { expiresIn: '3h' }
    );

    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            _id: user._id,
            name: user.userName,
            email: user.email,
            avatar: user.profilePicture,
        },
        calendarId: user.calendarId,
    });
};


module.exports = handleGoogleLogin;