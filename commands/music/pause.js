/**
 * @author thxmasdev
 * @description Comando /pause — pausa o reanuda la canción actual.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa o reanuda la canción actual.'),

    async execute(interaction) {
        const player = interaction.client.lavalink.getPlayer(interaction.guildId);

        if (!player || (!player.playing && !player.paused)) {
            return interaction.reply({ embeds: [errEmbed('No hay nada reproduciendo.')], ephemeral: true });
        }

        if (player.paused) {
            await player.resume();
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x57F287)
                        .setAuthor({ name: '▶️  Reanudado  •  OWGalaxy Music' })
                        .setDescription(`> **${player.queue.current?.info?.title ?? 'Canción actual'}**`)
                        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' }),
                ],
            });
        } else {
            await player.pause();
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFEE75C)
                        .setAuthor({ name: '⏸️  Pausado  •  OWGalaxy Music' })
                        .setDescription(`> **${player.queue.current?.info?.title ?? 'Canción actual'}**`)
                        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' }),
                ],
            });
        }
    },
};

function errEmbed(desc) {
    return new EmbedBuilder().setColor(0xED4245).setDescription(`❌ ${desc}`)
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' });
}
