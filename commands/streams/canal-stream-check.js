/**
 * @author thxmasdev
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Streamer, StreamHistory } = require('../../database/models');
const { getTwitchStream, getTwitchUser, getKickStream } = require('../../services/streamApi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canal-stream-check')
        .setDescription('Verifica el estado actual de un streamer manualmente.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(opt =>
            opt.setName('username')
                .setDescription('Nombre de usuario del streamer')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('plataforma')
                .setDescription('Plataforma del streamer')
                .setRequired(true)
                .addChoices(
                    { name: '🟣 Twitch', value: 'twitch' },
                    { name: '🟢 Kick', value: 'kick' },
                )),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const username = interaction.options.getString('username').trim().toLowerCase();
        const platform = interaction.options.getString('plataforma');
        const { twitchClientId, twitchClientSecret } = require('../../config.json');

        let embed;

        if (platform === 'twitch') {
            const user = await getTwitchUser(username, twitchClientId, twitchClientSecret);
            if (!user) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF4444)
                            .setDescription(`❌ No se encontró el usuario **${username}** en Twitch.`),
                    ],
                });
            }

            const stream = await getTwitchStream(user.id, twitchClientId, twitchClientSecret);

            if (stream) {
                const streamUrl = `https://twitch.tv/${username}`;
                const thumbnailWithCache = `${stream.thumbnail_url}?t=${Date.now()}`;
                const viewers = stream.viewer_count?.toLocaleString('es') ?? '0';
                const startedTs = Math.floor(new Date(stream.started_at).getTime() / 1000);

                embed = new EmbedBuilder()
                    .setColor(0x9146FF)
                    .setAuthor({
                        name: user.display_name,
                        iconURL: user.profile_image_url,
                        url: streamUrl,
                    })
                    .setDescription(`**[${stream.title || 'Sin título'}](${streamUrl})**\n\nPlaying **${stream.game_name || 'Sin categoría'}** · 👁️ ${viewers} espectadores · <t:${startedTs}:R>`)
                    .setImage(thumbnailWithCache)
                    .setFooter({
                        text: 'OWGalaxy Stream Notifier • Twitch',
                        iconURL: 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c1.png',
                    })
                    .setTimestamp(new Date(stream.started_at));
            } else {
                embed = new EmbedBuilder()
                    .setColor(0x6E6E6E)
                    .setAuthor({ name: user.display_name, iconURL: user.profile_image_url, url: `https://twitch.tv/${username}` })
                    .setDescription(`⚫ **${user.display_name}** está actualmente **offline** en Twitch.`)
                    .setThumbnail(user.profile_image_url)
                    .setFooter({
                        text: 'OWGalaxy Stream Notifier • Twitch',
                        iconURL: 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c1.png',
                    })
                    .setTimestamp();
            }
        } else {
            const stream = await getKickStream(username);
            const kickChannel = await require('../../services/streamApi').getKickChannel(username);

            if (!kickChannel) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF4444)
                            .setDescription(`❌ No se encontró el canal **${username}** en Kick.`),
                    ],
                });
            }

            if (stream) {
                const thumbnail = stream.thumbnail ? `${stream.thumbnail}?t=${Date.now()}` : null;
                const viewers = stream.viewers?.toLocaleString('es') ?? '0';
                const startedTs = Math.floor(new Date(stream.startedAt).getTime() / 1000);
                const profileImg = stream.profileImage || 'https://kick.com/favicon.ico';

                embed = new EmbedBuilder()
                    .setColor(0x53FC18)
                    .setAuthor({
                        name: stream.displayName,
                        iconURL: profileImg,
                        url: stream.url,
                    })
                    .setDescription(`**[${stream.title || 'Sin título'}](${stream.url})**\n\nPlaying **${stream.game || 'Sin categoría'}** · 👁️ ${viewers} espectadores · <t:${startedTs}:R>`)
                    .setImage(thumbnail)
                    .setFooter({
                        text: 'OWGalaxy Stream Notifier • Kick',
                        iconURL: 'https://kick.com/favicon.ico',
                    })
                    .setTimestamp(new Date(stream.startedAt));
            } else {
                const displayName = kickChannel.user?.username || username;
                const profileImage = kickChannel.user?.profile_pic || null;
                embed = new EmbedBuilder()
                    .setColor(0x6E6E6E)
                    .setAuthor({ name: displayName, iconURL: profileImage || undefined, url: `https://kick.com/${username}` })
                    .setDescription(`⚫ **${displayName}** está actualmente **offline** en Kick.`)
                    .setThumbnail(profileImage)
                    .setFooter({
                        text: 'OWGalaxy Stream Notifier • Kick',
                        iconURL: 'https://kick.com/favicon.ico',
                    })
                    .setTimestamp();
            }
        }

        return interaction.editReply({ embeds: [embed] });
    },
};
