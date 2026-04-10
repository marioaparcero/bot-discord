/**
 * @author thxmasdev
 */
const { EmbedBuilder, Colors } = require('discord.js');
const cron = require('node-cron');
const { Streamer, GuildConfig, StreamHistory } = require('../database/models');
const { getTwitchUser, getTwitchStream, getKickStream } = require('./streamApi');

// Evitar doble notificación durante el polling
const notifiedStreams = new Set(); // key: `${guildId}-${platform}-${username}`

/**
 * Construye el embed de Twitch para notificación de stream online.
 */
function buildTwitchEmbed(streamer, stream) {
    const streamUrl = `https://www.twitch.tv/${streamer.username}`;
    const thumbnailWithCache = `${stream.thumbnail_url}?t=${Date.now()}`;
    const viewers = stream.viewer_count?.toLocaleString('es') ?? '0';

    return new EmbedBuilder()
        .setColor(0x9146FF)
        // Author: solo el nombre de usuario visible (el link queda invisible en el icono)
        .setAuthor({
            name: stream.user_name,
            iconURL: streamer.profileImage || 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c1.png',
            url: streamUrl,
        })
        // Descripción: título del directo + juego que está jugando
        .setDescription(`**[${stream.title || 'Sin título'}](${streamUrl})**\n\nPlaying **${stream.game_name || 'Sin categoría'}** · 👁️ ${viewers} espectadores`)
        // Miniatura grande del stream
        .setImage(thumbnailWithCache)
        // Footer con logo de Twitch y timestamp
        .setFooter({
            text: 'OWGalaxy Stream Notifier • Twitch',
            iconURL: 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c1.png',
        })
        .setTimestamp(new Date(stream.started_at));
}

/**
 * Construye el embed de Kick para notificación de stream online.
 */
function buildKickEmbed(streamer, stream) {
    const kickIconUrl = 'https://kick.com/favicon.ico';
    const profileImg = stream.profileImage || streamer.profileImage || kickIconUrl;
    const viewers = stream.viewers?.toLocaleString('es') ?? '0';
    const thumbnail = stream.thumbnail ? `${stream.thumbnail}?t=${Date.now()}` : null;

    return new EmbedBuilder()
        .setColor(0x53FC18)
        // Author: solo el nombre de usuario visible
        .setAuthor({
            name: stream.displayName,
            iconURL: profileImg,
            url: stream.url,
        })
        // Descripción: título del directo + juego que está jugando
        .setDescription(`**[${stream.title || 'Sin título'}](${stream.url})**\n\nPlaying **${stream.game || 'Sin categoría'}** · 👁️ ${viewers} espectadores`)
        // Miniatura grande del stream
        .setImage(thumbnail)
        // Footer con logo de Kick y timestamp
        .setFooter({
            text: 'OWGalaxy Stream Notifier • Kick',
            iconURL: kickIconUrl,
        })
        .setTimestamp(new Date(stream.startedAt));
}

/**
 * Envía la notificación al canal de Discord del guild.
 * @param {string} liveText - Texto plano que aparece ENCIMA del embed (ej: "https://twitch.tv/user is now live on Twitch!")
 */
async function sendStreamNotification(client, guildId, streamer, embed, streamUrl, liveText) {
    try {
        const config = await GuildConfig.findOne({ guildId });
        if (!config?.notificationChannelId) return;

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(config.notificationChannelId);
        if (!channel) return;

        // Construir el contenido del mensaje
        let content;
        if (config?.customMessage) {
            // Aplicar plantilla personalizada: reemplazar $link y $user
            const userMention = streamer.discordUserId
                ? `<@${streamer.discordUserId}>`
                : (streamer.displayName || streamer.username);

            content = config.customMessage
                .replace(/\$link/g, streamUrl)
                .replace(/\$user/g, userMention);
        } else {
            // Mensaje por defecto (liveText ya viene construido con mención si aplica)
            content = liveText;
        }

        const msg = await channel.send({ content, embeds: [embed] });

        // Guardar en historial
        await StreamHistory.create({
            guildId,
            streamerId: streamer._id,
            username: streamer.username,
            platform: streamer.platform,
            title: embed.data.description?.split('\n')[0]?.replace(/\*\*/g, '').trim() || 'Sin título',
            messageId: msg.id,
            streamUrl,
        });

    } catch (err) {
        console.error(`[Notifier] Error enviando notificación para ${streamer.username}:`, err.message);
    }
}

/**
 * Verifica el estado de todos los streamers registrados y envía notificaciones.
 */
async function checkStreamers(client) {
    const { twitchClientId, twitchClientSecret } = require('../config.json');

    try {
        const streamers = await Streamer.find({});
        if (streamers.length === 0) return;

        for (const streamer of streamers) {
            const key = `${streamer.guildId}-${streamer.platform}-${streamer.username}`;

            if (streamer.platform === 'twitch') {
                // Asegurarnos de tener el userId
                let userId = streamer.userId;
                if (!userId) {
                    const user = await getTwitchUser(streamer.username, twitchClientId, twitchClientSecret);
                    if (!user) continue;
                    userId = user.id;
                    streamer.userId = userId;
                    streamer.displayName = user.display_name;
                    streamer.profileImage = user.profile_image_url;
                    await streamer.save();
                }

                const stream = await getTwitchStream(userId, twitchClientId, twitchClientSecret);

                if (stream) {
                    // Streamer en vivo
                    const uniqueId = `${key}-${stream.id}`;
                    if (!streamer.isLive || streamer.lastStreamId !== stream.id) {
                        // Nuevo stream, notificar
                        if (!notifiedStreams.has(uniqueId)) {
                            notifiedStreams.add(uniqueId);
                            const embed = buildTwitchEmbed(streamer, stream);
                            const streamUrl = `https://twitch.tv/${streamer.username}`;
                            const liveText = streamer.discordUserId
                                ? `🚨ATENCIÓN🚨 <@${streamer.discordUserId}> está en directo: ${streamUrl}`
                                : `${streamUrl} is now live on Twitch!`;
                            await sendStreamNotification(client, streamer.guildId, streamer, embed, streamUrl, liveText);
                            console.log(`[Twitch] 🔴 ${streamer.username} está en VIVO (Guild: ${streamer.guildId})`);
                        }
                        streamer.isLive = true;
                        streamer.lastStreamId = stream.id;
                        streamer.lastNotificationAt = new Date();
                        await streamer.save();
                    }
                } else {
                    // Offline
                    if (streamer.isLive) {
                        console.log(`[Twitch] ⚫ ${streamer.username} está offline (Guild: ${streamer.guildId})`);
                    }
                    streamer.isLive = false;
                    // Limpiar notified set para permitir notificación del próximo stream
                    for (const k of notifiedStreams) {
                        if (k.startsWith(key)) notifiedStreams.delete(k);
                    }
                    await streamer.save();
                }

            } else if (streamer.platform === 'kick') {
                const stream = await getKickStream(streamer.username);

                if (stream) {
                    const uniqueId = `${key}-${stream.id}`;
                    if (!streamer.isLive || streamer.lastStreamId !== stream.id) {
                        if (!notifiedStreams.has(uniqueId)) {
                            notifiedStreams.add(uniqueId);
                            // Actualizar profile si lo tenemos
                            if (stream.profileImage && !streamer.profileImage) {
                                streamer.profileImage = stream.profileImage;
                            }
                            if (stream.displayName && !streamer.displayName) {
                                streamer.displayName = stream.displayName;
                            }
                            const embed = buildKickEmbed(streamer, stream);
                            const liveText = streamer.discordUserId
                                ? `🚨ATENCIÓN🚨 <@${streamer.discordUserId}> está en directo: ${stream.url}`
                                : `${stream.url} is now live on Kick!`;
                            await sendStreamNotification(client, streamer.guildId, streamer, embed, stream.url, liveText);
                            console.log(`[Kick] 🟢 ${streamer.username} está en VIVO (Guild: ${streamer.guildId})`);
                        }
                        streamer.isLive = true;
                        streamer.lastStreamId = stream.id;
                        streamer.lastNotificationAt = new Date();
                        await streamer.save();
                    }
                } else {
                    if (streamer.isLive) {
                        console.log(`[Kick] ⚫ ${streamer.username} está offline (Guild: ${streamer.guildId})`);
                    }
                    streamer.isLive = false;
                    for (const k of notifiedStreams) {
                        if (k.startsWith(key)) notifiedStreams.delete(k);
                    }
                    await streamer.save();
                }
            }

            // Pequeña pausa entre requests para no saturar las APIs
            await new Promise(r => setTimeout(r, 500));
        }
    } catch (err) {
        console.error('[Checker] Error en checkStreamers:', err.message);
    }
}

/**
 * Inicia el cron job que verifica los streamers cada 2 minutos.
 */
function startStreamChecker(client) {
    console.log('[Checker] ⏰ Iniciando verificador de streams (cada 2 minutos)...');
    // Verificar inmediatamente al iniciar
    setTimeout(() => checkStreamers(client), 5000);
    // Luego cada 2 minutos
    cron.schedule('*/2 * * * *', () => checkStreamers(client));
}

module.exports = { startStreamChecker, checkStreamers };
