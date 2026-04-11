/**
 * @author thxmasdev
 * @description Comando /volume — ajusta el volumen del reproductor.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Ajusta el volumen del reproductor (1–100).')
        .addIntegerOption(opt =>
            opt
                .setName('nivel')
                .setDescription('Volumen (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100),
        ),

    async execute(interaction) {
        const player = interaction.client.lavalink.getPlayer(interaction.guildId);

        if (!player || (!player.playing && !player.paused)) {
            return interaction.reply({ embeds: [errEmbed('No hay nada reproduciendo.')], ephemeral: true });
        }

        const vol   = interaction.options.getInteger('nivel');
        const emoji = vol === 0 ? '🔇' : vol < 30 ? '🔈' : vol < 70 ? '🔉' : '🔊';

        await player.setVolume(vol);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setAuthor({ name: `${emoji}  Volumen ajustado  •  OWGalaxy Music` })
                    .setDescription(`> Nuevo volumen: **${vol}%**`)
                    .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' }),
            ],
        });
    },
};

function errEmbed(desc) {
    return new EmbedBuilder().setColor(0xED4245).setDescription(`❌ ${desc}`)
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' });
}
