const { Schema, model } = require('mongoose');

let ticketSchema = new Schema({
    Guild: String,
    Category: String
});

module.exports = model('ticketSchema10010101', ticketSchema);