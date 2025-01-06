const { Schema, model } = require('mongoose');

let modmail = new Schema({
    userId: String,
    moderator: String,
    channel: String,
    issue: String,
    welcome: Boolean,
});

module.exports = model('ModmailData', modmail)