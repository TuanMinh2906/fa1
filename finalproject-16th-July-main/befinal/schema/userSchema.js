const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: false // ✅ Không bắt buộc nếu login bằng Google
    },
    passwordHash: {
        type: String,
        required: function () {
            return this.provider !== 'google';
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    profilePicture: {
        type: String,
        default: ''
    },
    calendarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Calendar'
    },
    provider: {
        type: String,
        default: 'local' // 'local' hoặc 'google'
    },
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    sentRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
