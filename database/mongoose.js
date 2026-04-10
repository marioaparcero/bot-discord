/**
 * @author thxmasdev
 */
const mongoose = require('mongoose');
const { mongoUri } = require('../config.json');

let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    try {
        await mongoose.connect(mongoUri);
        isConnected = true;
        console.log('[MongoDB] Conectado correctamente.');
    } catch (err) {
        console.error('[MongoDB] Error al conectar:', err.message);
        process.exit(1);
    }
}

module.exports = { connectDB };
