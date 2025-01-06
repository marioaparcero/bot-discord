const { Schema, model } = require('mongoose');

const guildPremiumSchema = new Schema({
    guildID: { type: String, required: true, unique: true }
});

module.exports = model('GuildPremium', guildPremiumSchema);
