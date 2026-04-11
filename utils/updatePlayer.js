/**
 * @author thxmasdev
 * @description Actualiza el mensaje del player embed almacenado en playerStore.
 */

const { buildPlayerEmbed } = require('./playerEmbed');
const { getPlayerData }    = require('./playerStore');

/**
 * @param {import('lavalink-client').Player} player
 * @param {import('discord.js').Client} client
 */
async function updatePlayerMessage(player, client) {
    const ref = getPlayerData(player.guildId, 'playerMessage');
    if (!ref) return;

    try {
        const channel = await client.channels.fetch(ref.channelId).catch(() => null);
        if (!channel) return;

        const message = await channel.messages.fetch(ref.messageId).catch(() => null);
        if (!message) return;

        const data = buildPlayerEmbed(player);
        if (data) await message.edit(data).catch(() => {});
    } catch { /* ignorar errores de red/permisos */ }
}

module.exports = { updatePlayerMessage };
