/**
 * @author thxmasdev
 * @description Comando /skip — salta la canción actual.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta la canción actual y pasa a la siguiente en la cola.'),

    async execute(interaction) {
        const player = interaction.client.lavalink.getPlayer(interaction.guildId);

        if (!player || !player.playing) {
            return interaction.reply({ embeds: [errEmbed('No hay nada reproduciendo.')], ephemeral: true });
        }

        const skipped = player.queue.current;
        await player.skip();

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setAuthor({ name: '⏭️  Canción saltada  •  OWGalaxy Music' })
                    .setDescription(`> **${skipped?.info?.title ?? 'Canción actual'}**`)
                    .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' }),
            ],
        });
    },
};

function errEmbed(desc) {
    return new EmbedBuilder().setColor(0xED4245).setDescription(`❌ ${desc}`)
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' });
}
