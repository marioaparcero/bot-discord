/**
 * @author thxmasdev
 * @description Eventos del LavalinkManager: trackStart, queueEnd, playerDestroy, errores.
 * NOTA: No se usa 'playerUpdate' porque dispara cada 100ms y no es necesario para el embed.
 */

const { EmbedBuilder } = require('discord.js');
const { buildPlayerEmbed }  = require('./playerEmbed');
const { setPlayerData, getPlayerData, clearPlayerData } = require('./playerStore');

/**
 * @param {import('discord.js').Client} client
 */
function registerLavalinkEvents(client) {
    const lava = client.lavalink;

    // ── Nodo conectado / desconectado ─────────────────────────────────────────
    lava.nodeManager.on('connect', node => {
        console.log(`✅ Lavalink node conectado: ${node.id}`);
    });

    lava.nodeManager.on('disconnect', (node, reason) => {
        console.warn(`⚠️  Lavalink node desconectado: ${node.id}`, reason);
    });

    lava.nodeManager.on('error', (node, error) => {
        console.error(`❌ Error en Lavalink node ${node.id}:`, error?.message ?? error);
    });

    // ── trackStart — nueva canción ────────────────────────────────────────────
    lava.on('trackStart', async (player, track) => {
        try {
            const channel = await client.channels.fetch(player.textChannelId).catch(() => null);
            if (!channel) return;

            const data = buildPlayerEmbed(player);
            if (!data) return;

            // Intentar editar el mensaje existente del player
            const ref = getPlayerData(player.guildId, 'playerMessage');
            if (ref && ref.channelId === player.textChannelId) {
                const msg = await channel.messages.fetch(ref.messageId).catch(() => null);
                if (msg) {
                    await msg.edit(data).catch(() => {});
                    return;
                }
            }

            // No hay mensaje o fue borrado → enviar uno nuevo
            const msg = await channel.send(data);
            setPlayerData(player.guildId, 'playerMessage', {
                channelId: channel.id,
                messageId: msg.id,
            });
        } catch (err) {
            console.error('[trackStart]', err?.message ?? err);
        }
    });

    // ── queueEnd — cola vacía ─────────────────────────────────────────────────
    lava.on('queueEnd', async (player) => {
        try {
            const ref = getPlayerData(player.guildId, 'playerMessage');
            if (!ref) return;

            const channel = await client.channels.fetch(ref.channelId).catch(() => null);
            if (!channel) return;

            const msg = await channel.messages.fetch(ref.messageId).catch(() => null);
            if (!msg) return;

            await msg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x5865F2)
                        .setAuthor({ name: '📭  Cola vacía  •  OWGalaxy Music' })
                        .setDescription(
                            '> No hay más canciones en la cola.\n' +
                            '> Usá `/play` para agregar más música.',
                        )
                        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' })
                        .setTimestamp(),
                ],
                components: [],
            }).catch(() => {});
        } catch { /* ignorar */ }
    });

    // ── playerDestroy — bot desconectado ──────────────────────────────────────
    lava.on('playerDestroy', async (player) => {
        try {
            const ref = getPlayerData(player.guildId, 'playerMessage');
            if (ref) {
                const channel = await client.channels.fetch(ref.channelId).catch(() => null);
                if (channel) {
                    const msg = await channel.messages.fetch(ref.messageId).catch(() => null);
                    if (msg) {
                        await msg.edit({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(0xED4245)
                                    .setAuthor({ name: '⏹️  Reproductor detenido  •  OWGalaxy Music' })
                                    .setDescription('> El reproductor fue desconectado.')
                                    .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' }),
                            ],
                            components: [],
                        }).catch(() => {});
                    }
                }
            }
        } catch { /* ignorar */ } finally {
            clearPlayerData(player.guildId);
        }
    });

    // ── trackError ────────────────────────────────────────────────────────────
    lava.on('trackError', async (player, track, payload) => {
        const msg = payload?.exception?.message ?? 'Error desconocido';
        console.error(`[trackError] "${track?.info?.title}" → ${msg}`);

        try {
            const channel = await client.channels.fetch(player.textChannelId).catch(() => null);
            if (channel) {
                await channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xED4245)
                            .setAuthor({ name: '❌  Error al reproducir  •  OWGalaxy Music' })
                            .setDescription(
                                `> **${track?.info?.title ?? 'Track desconocido'}**\n` +
                                `> \`${msg}\``,
                            )
                            .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' }),
                    ],
                }).catch(() => {});
            }
        } catch { /* ignorar */ }
    });

    // ── trackStuck ────────────────────────────────────────────────────────────
    lava.on('trackStuck', async (player, track) => {
        console.warn(`[trackStuck] Saltando track atascado: "${track?.info?.title}"`);
        await player.skip().catch(() => {});
    });
}

module.exports = { registerLavalinkEvents };
