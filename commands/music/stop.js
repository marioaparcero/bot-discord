/**
 * @author thxmasdev
 * @description Comando /stop — detiene la música y desconecta.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la música, limpia la cola y desconecta el bot.'),

    async execute(interaction) {
        const player = interaction.client.lavalink.getPlayer(interaction.guildId);

        if (!player) {
            return interaction.reply({ embeds: [errEmbed('No hay ningún reproductor activo.')], ephemeral: true });
        }

        await player.destroy();

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0xED4245)
                    .setAuthor({ name: '⏹️  Música detenida  •  OWGalaxy Music' })
                    .setDescription('> La música fue detenida, la cola vaciada y el bot desconectado.')
                    .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' }),
            ],
        });
    },
};

function errEmbed(desc) {
    return new EmbedBuilder().setColor(0xED4245).setDescription(`❌ ${desc}`)
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' });
}
