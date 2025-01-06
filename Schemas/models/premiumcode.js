const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    code: String,
    plan: String
});

module.exports = mongoose.model("premiumcode", Schema);