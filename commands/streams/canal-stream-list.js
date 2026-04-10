/**
 * @author thxmasdev
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Streamer, GuildConfig } = require('../../database/models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canal-stream-list')
        .setDescription('Muestra la lista de streamers monitoreados en este servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guildId;
        const streamers = await Streamer.find({ guildId }).sort({ platform: 1, username: 1 });
        const config = await GuildConfig.findOne({ guildId });

        if (streamers.length === 0) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFFAA00)
                        .setTitle('📋 Lista de streamers')
                        .setDescription('No hay ningún streamer registrado en este servidor.\n\nUsa `/canal-stream-add` para agregar uno.')
                        .setTimestamp(),
                ],
            });
        }

        const twitchStreamers = streamers.filter(s => s.platform === 'twitch');
        const kickStreamers = streamers.filter(s => s.platform === 'kick');

        const formatStreamer = (s) => {
            const liveStatus = s.isLive ? '🔴 **EN VIVO**' : '⚫ Offline';
            const url = s.platform === 'twitch'
                ? `[${s.displayName || s.username}](https://twitch.tv/${s.username})`
                : `[${s.displayName || s.username}](https://kick.com/${s.username})`;
            return `${liveStatus} • ${url}`;
        };

        const notificationChannel = config?.notificationChannelId
            ? `<#${config.notificationChannelId}>`
            : '❌ No configurado';

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`📋 Streamers monitoreados · ${interaction.guild.name}`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields(
                {
                    name: '⚙️ Configuración',
                    value: `📢 Canal: ${notificationChannel}`,
                    inline: false,
                },
            )
            .setFooter({ text: `Total: ${streamers.length}/25 streamers` })
            .setTimestamp();

        if (twitchStreamers.length > 0) {
            embed.addFields({
                name: `🟣 Twitch (${twitchStreamers.length})`,
                value: twitchStreamers.map(formatStreamer).join('\n'),
                inline: false,
            });
        }

        if (kickStreamers.length > 0) {
            embed.addFields({
                name: `🟢 Kick (${kickStreamers.length})`,
                value: kickStreamers.map(formatStreamer).join('\n'),
                inline: false,
            });
        }

        return interaction.editReply({ embeds: [embed] });
    },
};
