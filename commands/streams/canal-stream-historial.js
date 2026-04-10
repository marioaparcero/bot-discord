/**
 * @author thxmasdev
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { StreamHistory, Streamer } = require('../../database/models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canal-stream-historial')
        .setDescription('Muestra el historial de streams notificados en este servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addIntegerOption(opt =>
            opt.setName('cantidad')
                .setDescription('Cantidad de registros a mostrar (máx. 10)')
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(false))
        .addStringOption(opt =>
            opt.setName('plataforma')
                .setDescription('Filtrar por plataforma')
                .setRequired(false)
                .addChoices(
                    { name: '🟣 Twitch', value: 'twitch' },
                    { name: '🟢 Kick', value: 'kick' },
                )),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guildId;
        const cantidad = interaction.options.getInteger('cantidad') || 5;
        const platform = interaction.options.getString('plataforma');

        const query = { guildId };
        if (platform) query.platform = platform;

        const history = await StreamHistory.find(query)
            .sort({ startedAt: -1 })
            .limit(cantidad);

        if (history.length === 0) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFFAA00)
                        .setTitle('📜 Historial de streams')
                        .setDescription('No hay registros de streams notificados en este servidor.')
                        .setTimestamp(),
                ],
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`📜 Historial de streams · ${interaction.guild.name}`)
            .setFooter({ text: `Mostrando ${history.length} de los últimos streams notificados` })
            .setTimestamp();

        for (const h of history) {
            const platformEmoji = h.platform === 'twitch' ? '🟣' : '🟢';
            const url = h.platform === 'twitch'
                ? `[Ver canal](https://twitch.tv/${h.username})`
                : `[Ver canal](https://kick.com/${h.username})`;
            const timeAgo = `<t:${Math.floor(new Date(h.startedAt).getTime() / 1000)}:R>`;

            embed.addFields({
                name: `${platformEmoji} ${h.username}`,
                value: `📺 **${h.title || 'Sin título'}**\n🎮 ${h.game || 'Sin categoría'} · 👁️ ${h.viewers?.toLocaleString('es') || '0'}\n⏰ ${timeAgo} · ${url}`,
                inline: false,
            });
        }

        return interaction.editReply({ embeds: [embed] });
    },
};
