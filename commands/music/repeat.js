/**
 * @author thxmasdev
 * @description Comando /repeat — cambia el modo de repetición.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const MODES = {
    off: { icon: '➡️', label: 'Desactivada', color: 0x5865F2 },
    track: { icon: '🔂', label: 'Repitiendo canción', color: 0x57F287 },
    queue: { icon: '🔁', label: 'Repitiendo cola', color: 0x57F287 },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repeat')
        .setDescription('Cambia el modo de repetición.')
        .addStringOption(opt =>
            opt
                .setName('modo')
                .setDescription('Modo de repetición')
                .setRequired(true)
                .addChoices(
                    { name: '➡️  Desactivado', value: 'off' },
                    { name: '🔂  Repetir canción actual', value: 'track' },
                    { name: '🔁  Repetir cola completa', value: 'queue' },
                ),
        ),

    async execute(interaction) {
        const player = interaction.client.lavalink.getPlayer(interaction.guildId);

        if (!player || (!player.playing && !player.paused)) {
            return interaction.reply({ embeds: [errEmbed('No hay nada reproduciendo.')], ephemeral: true });
        }

        const mode = interaction.options.getString('modo');
        await player.setRepeatMode(mode);

        const m = MODES[mode];
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(m.color)
                    .setAuthor({ name: `${m.icon}  Repetición  •  OWGalaxy Music` })
                    .setDescription(`> **${m.label}**`)
                    .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' }),
            ],
        });
    },
};

function errEmbed(desc) {
    return new EmbedBuilder().setColor(0xED4245).setDescription(`❌ ${desc}`)
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' });
}
