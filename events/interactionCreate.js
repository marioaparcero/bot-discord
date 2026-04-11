/**
 * @author thxmasdev
 * @description Maneja slash commands y botones del reproductor.
 */

const { Events, EmbedBuilder } = require('discord.js');
const { buildPlayerEmbed }               = require('../utils/playerEmbed');
const { setPlayerData, getPlayerData }   = require('../utils/playerStore');

const C = { main: 0x5865F2, error: 0xED4245, success: 0x57F287 };

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {

        // ── Slash Commands ─────────────────────────────────────────────────────
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`[/${interaction.commandName}]`, error);
                const reply = { embeds: [errEmbed('❌ Hubo un error ejecutando el comando.')], ephemeral: true };
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply(reply).catch(() => {});
                } else {
                    await interaction.reply(reply).catch(() => {});
                }
            }
            return;
        }

        // ── Botones del player ─────────────────────────────────────────────────
        if (interaction.isButton() && interaction.customId.startsWith('music_')) {
            await interaction.deferUpdate();

            const player = client.lavalink.getPlayer(interaction.guildId);

            // Player inexistente
            if (!player) {
                return interaction.followUp({
                    embeds    : [errEmbed('❌ No hay ningún reproductor activo.')],
                    ephemeral : true,
                }).catch(() => {});
            }

            // Verificar que el usuario esté en el mismo canal de voz
            const vcId = interaction.member?.voice?.channelId;
            if (!vcId || vcId !== player.voiceChannelId) {
                return interaction.followUp({
                    embeds    : [errEmbed('🔇 Tenés que estar en el mismo canal de voz que el bot.')],
                    ephemeral : true,
                }).catch(() => {});
            }

            const { customId } = interaction;

            switch (customId) {
                // ── Anterior ──────────────────────────────────────────────────
                case 'music_previous': {
                    if ((player.position ?? 0) > 5000) {
                        // Más de 5 seg → reiniciar canción actual
                        await player.seek(0).catch(() => {});
                    } else {
                        const prev = player.queue.previous?.[0];
                        if (prev) {
                            await player.queue.add([prev], 0);
                            await player.skip().catch(() => {});
                        } else {
                            await player.seek(0).catch(() => {});
                        }
                    }
                    break;
                }

                // ── Pausa / Reanudar ──────────────────────────────────────────
                case 'music_pause':
                    if (player.paused) await player.resume().catch(() => {});
                    else await player.pause().catch(() => {});
                    break;

                // ── Siguiente ─────────────────────────────────────────────────
                case 'music_skip':
                    await player.skip().catch(() => {});
                    break;

                // ── Detener ───────────────────────────────────────────────────
                case 'music_stop':
                    await player.destroy().catch(() => {});
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(C.error)
                                .setAuthor({ name: '⏹️  Reproductor detenido  •  OWGalaxy Music' })
                                .setDescription('> La música fue detenida y la cola vaciada.')
                                .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' }),
                        ],
                        components: [],
                    }).catch(() => {});
                    return;

                // ── Mezclar ───────────────────────────────────────────────────
                case 'music_shuffle':
                    player.queue.shuffle();
                    break;

                // ── Repetición (ciclar) ───────────────────────────────────────
                case 'music_repeat': {
                    const modes = ['off', 'track', 'queue'];
                    const next  = modes[(modes.indexOf(player.repeatMode ?? 'off') + 1) % modes.length];
                    await player.setRepeatMode(next).catch(() => {});
                    break;
                }

                // ── Ver cola (ephemeral) ──────────────────────────────────────
                case 'music_queue': {
                    const current = player.queue.current;
                    const q       = player.queue.tracks?.slice(0, 10) ?? [];
                    const total   = player.queue.tracks?.length ?? 0;

                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(C.main)
                                .setAuthor({ name: '📋  Cola de reproducción  •  OWGalaxy Music' })
                                .setDescription(
                                    (current
                                        ? `**▶️ Ahora:** [${current.info.title}](${current.info.uri})\n\n`
                                        : '') +
                                    (q.length > 0
                                        ? q.map((t, i) => `\`${i + 1}.\` ${t.info.title}`).join('\n')
                                        : '_Cola vacía._') +
                                    (total > 10 ? `\n\n_…y ${total - 10} más._` : ''),
                                )
                                .setFooter({ text: `${total} tema(s) en cola  •  thxmasdev` }),
                        ],
                        ephemeral: true,
                    }).catch(() => {});
                    return;
                }

                // ── Volumen ───────────────────────────────────────────────────
                case 'music_vol_down': {
                    const v = Math.max(0, (player.volume ?? 80) - 10);
                    await player.setVolume(v).catch(() => {});
                    break;
                }
                case 'music_vol_up': {
                    const v = Math.min(100, (player.volume ?? 80) + 10);
                    await player.setVolume(v).catch(() => {});
                    break;
                }
            }

            // Actualizar el embed del player tras la acción
            if (player.queue?.current) {
                const updated = buildPlayerEmbed(player);
                if (updated) await interaction.editReply(updated).catch(() => {});
            }
        }
    },
};

function errEmbed(desc) {
    return new EmbedBuilder()
        .setColor(0xED4245)
        .setDescription(desc)
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' });
}