/**
 * @author thxmasdev
 * @description Comando /nowplaying — muestra el reproductor con controles.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { buildPlayerEmbed } = require('../../utils/playerEmbed');
const { setPlayerData } = require('../../utils/playerStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Muestra el reproductor con la canción actual y los controles.'),

    async execute(interaction) {
        const player = interaction.client.lavalink.getPlayer(interaction.guildId);

        if (!player || (!player.playing && !player.paused)) {
            return interaction.reply({ embeds: [errEmbed('No hay nada reproduciendo.')], ephemeral: true });
        }

        const data = buildPlayerEmbed(player);
        if (!data) {
            return interaction.reply({ embeds: [errEmbed('No hay ninguna canción cargada.')], ephemeral: true });
        }

        const msg = await interaction.reply({ ...data, fetchReply: true });

        setPlayerData(player.guildId, 'playerMessage', {
            channelId: interaction.channelId,
            messageId: msg.id,
        });
    },
};

function errEmbed(desc) {
    return new EmbedBuilder().setColor(0xED4245).setDescription(`❌ ${desc}`)
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' });
}
