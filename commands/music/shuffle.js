/**
 * @author thxmasdev
 * @description Comando /shuffle — mezcla la cola aleatoriamente.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Mezcla aleatoriamente la cola de reproducción.'),

    async execute(interaction) {
        const player = interaction.client.lavalink.getPlayer(interaction.guildId);

        if (!player || (player.queue.tracks?.length ?? 0) < 2) {
            return interaction.reply({
                embeds   : [errEmbed('Necesitás al menos **2 canciones** en la cola para mezclar.')],
                ephemeral: true,
            });
        }

        player.queue.shuffle();

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setAuthor({ name: '🔀  Cola mezclada  •  OWGalaxy Music' })
                    .setDescription(`> **${player.queue.tracks.length} temas** reordenados aleatoriamente.`)
                    .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' }),
            ],
        });
    },
};

function errEmbed(desc) {
    return new EmbedBuilder().setColor(0xED4245).setDescription(`❌ ${desc}`)
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' });
}
