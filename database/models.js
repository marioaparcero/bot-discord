/**
 * @author thxmasdev
 */
const mongoose = require('mongoose');

// Schema de configuración por servidor (guild)
const guildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    notificationChannelId: { type: String, default: null }, // Canal donde se envían los embeds
    role_mention: { type: String, default: null }, // Rol a mencionar (@everyone, @here, o ID de rol)
    customMessage: { type: String, default: null }, // Mensaje personalizado para las notificaciones
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

guildConfigSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Schema de streamers monitoreados
const streamerSchema = new mongoose.Schema({
    guildId: { type: String, required: true },       // Guild de Discord
    username: { type: String, required: true },       // Nombre del streamer
    platform: { type: String, enum: ['twitch', 'kick'], required: true },
    userId: { type: String, default: null },          // ID del usuario en la plataforma
    displayName: { type: String, default: null },     // Nombre para mostrar
    profileImage: { type: String, default: null },    // Avatar del streamer
    discordUserId: { type: String, default: null },   // ID de Discord vinculado (mención en notificaciones)
    isLive: { type: Boolean, default: false },        // Estado actual del stream
    lastStreamId: { type: String, default: null },    // ID del último stream notificado
    lastNotificationAt: { type: Date, default: null },// Última notificación enviada
    addedBy: { type: String, default: null },         // ID del usuario de Discord que lo agregó
    createdAt: { type: Date, default: Date.now },
});

// Índice compuesto para evitar duplicados
streamerSchema.index({ guildId: 1, username: 1, platform: 1 }, { unique: true });

// Schema de historial de streams notificados
const streamHistorySchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    streamerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Streamer' },
    username: { type: String, required: true },
    platform: { type: String, required: true },
    title: { type: String, default: 'Sin título' },
    game: { type: String, default: 'Sin categoría' },
    viewers: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    thumbnail: { type: String, default: null },
    streamUrl: { type: String, default: null },
    messageId: { type: String, default: null }, // ID del mensaje de Discord enviado
});

const GuildConfig = mongoose.model('GuildConfig', guildConfigSchema);
const Streamer = mongoose.model('Streamer', streamerSchema);
const StreamHistory = mongoose.model('StreamHistory', streamHistorySchema);

module.exports = { GuildConfig, Streamer, StreamHistory };
