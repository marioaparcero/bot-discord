const { Schema, model } = require('mongoose');

const userPremiumSchema = new Schema({
    userID: { type: String, required: true, unique: true }
});

module.exports = model('UserPremium', userPremiumSchema);
