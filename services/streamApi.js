/**
 * @author thxmasdev
 */
const axios = require('axios');

// ─── Twitch App Access Token (Client Credentials) ────────────────────────────
let twitchToken = null;
let twitchTokenExpiry = null;

async function getTwitchToken(clientId, clientSecret) {
    if (twitchToken && twitchTokenExpiry && Date.now() < twitchTokenExpiry) {
        return twitchToken;
    }
    try {
        const res = await axios.post(`https://id.twitch.tv/oauth2/token`, null, {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials',
            },
        });
        twitchToken = res.data.access_token;
        // Expiración con 5 minutos de margen
        twitchTokenExpiry = Date.now() + (res.data.expires_in - 300) * 1000;
        return twitchToken;
    } catch (err) {
        console.error('[Twitch] Error obteniendo token:', err.response?.data || err.message);
        return null;
    }
}

/**
 * Obtiene la info del usuario de Twitch por su login name.
 * Retorna { id, login, display_name, profile_image_url } o null.
 */
async function getTwitchUser(username, clientId, clientSecret) {
    const token = await getTwitchToken(clientId, clientSecret);
    if (!token) return null;
    try {
        const res = await axios.get('https://api.twitch.tv/helix/users', {
            params: { login: username.toLowerCase() },
            headers: {
                'Client-ID': clientId,
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data.data[0] || null;
    } catch (err) {
        console.error(`[Twitch] Error obteniendo user ${username}:`, err.response?.data || err.message);
        return null;
    }
}

/**
 * Obtiene info del stream activo del usuario por su ID.
 * Retorna { id, user_name, title, game_name, viewer_count, thumbnail_url, started_at } o null si offline.
 */
async function getTwitchStream(userId, clientId, clientSecret) {
    const token = await getTwitchToken(clientId, clientSecret);
    if (!token) return null;
    try {
        const res = await axios.get('https://api.twitch.tv/helix/streams', {
            params: { user_id: userId },
            headers: {
                'Client-ID': clientId,
                Authorization: `Bearer ${token}`,
            },
        });
        const stream = res.data.data[0];
        if (!stream) return null;
        // Reemplazar placeholders de thumbnail
        stream.thumbnail_url = stream.thumbnail_url
            .replace('{width}', '1280')
            .replace('{height}', '720');
        return stream;
    } catch (err) {
        console.error(`[Twitch] Error obteniendo stream para ${userId}:`, err.response?.data || err.message);
        return null;
    }
}

/**
 * Obtiene info del canal de Twitch (descripción, etc.)
 */
async function getTwitchChannelInfo(broadcasterId, clientId, clientSecret) {
    const token = await getTwitchToken(clientId, clientSecret);
    if (!token) return null;
    try {
        const res = await axios.get('https://api.twitch.tv/helix/channels', {
            params: { broadcaster_id: broadcasterId },
            headers: {
                'Client-ID': clientId,
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data.data[0] || null;
    } catch (err) {
        return null;
    }
}

// ─── Kick API (Informal/Pública) ─────────────────────────────────────────────

/**
 * Obtiene info del canal de Kick por username.
 * Retorna la data del canal incluyendo si está live o no.
 */
async function getKickChannel(username) {
    try {
        // Kick tiene una API pública no oficial que devuelve info del canal
        const res = await axios.get(`https://kick.com/api/v1/channels/${username.toLowerCase()}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; StreamBot/1.0)',
            },
            timeout: 10000,
        });
        return res.data || null;
    } catch (err) {
        if (err.response?.status === 404) return null;
        console.error(`[Kick] Error obteniendo canal ${username}:`, err.response?.status || err.message);
        return null;
    }
}

/**
 * Verifica si un canal de Kick está en vivo.
 * Retorna objeto con info del stream o null.
 */
async function getKickStream(username) {
    const channel = await getKickChannel(username);
    if (!channel) return null;

    const livestream = channel.livestream || null;
    if (!livestream || !channel.is_banned) {
        // Verificar que realmente esté en vivo
        if (!livestream) return null;
    }

    return {
        id: livestream.id?.toString() || null,
        username: channel.slug || username,
        displayName: channel.user?.username || username,
        title: livestream.session_title || 'Sin título',
        game: livestream.categories?.[0]?.name || 'Sin categoría',
        viewers: livestream.viewer_count || 0,
        thumbnail: livestream.thumbnail?.url || `https://kick.com/api/v1/channels/${username}/livestream/poster`,
        profileImage: channel.user?.profile_pic || null,
        startedAt: livestream.start_time || new Date().toISOString(),
        language: livestream.language || 'es',
        url: `https://kick.com/${channel.slug || username}`,
        isMature: channel.is_mature || false,
    };
}

module.exports = {
    getTwitchUser,
    getTwitchStream,
    getTwitchChannelInfo,
    getKickChannel,
    getKickStream,
};
