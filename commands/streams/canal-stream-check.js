/**
 * @author thxmasdev
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Streamer, GuildConfig } = require('../../database/models');
const { getTwitchStream, getTwitchUser, getKickStream, getKickChannel } = require('../../services/streamApi');

/**
 * Construye el preview del mensaje que se enviaría al notificar.
 * Usa la plantilla configurada o el texto por defecto.
 */
function buildMessagePreview(config, streamer, streamUrl) {
    const userMention = streamer?.discordUserId
        ? `<@${streamer.discordUserId}>`
        : (streamer?.displayName || streamer?.username || 'streamer');

    if (config?.customMessage) {
        return config.customMessage
            .replace(/\$link/g, streamUrl)
            .replace(/\$user/g, userMention);
    }

    return streamer?.discordUserId
        ? `🚨ATENCIÓN🚨 ${userMention} está en directo: ${streamUrl}`
        : `${streamUrl} is now live on ${streamer?.platform === 'kick' ? 'Kick' : 'Twitch'}!`;
}

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

        // Obtener streamer y config del guild para preview del mensaje
        const [streamerDoc, guildConfig] = await Promise.all([
            Streamer.findOne({ guildId: interaction.guildId, username, platform }),
            GuildConfig.findOne({ guildId: interaction.guildId }),
        ]);

        let embed;
        let messagePreview = null;

        // ── TWITCH ────────────────────────────────────────────────────────────
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
                const hasGame = stream.game_name && stream.game_name.trim() !== '';

                if (!hasGame) {
                    // En vivo pero sin categoría → no se notificaría aún
                    embed = new EmbedBuilder()
                        .setColor(0xFFAA00)
                        .setAuthor({
                            name: user.display_name,
                            iconURL: user.profile_image_url,
                            url: streamUrl,
                        })
                        .setDescription(
                            `**[${stream.title || 'Sin título'}](${streamUrl})**\n\n` +
                            `⚠️ **Sin categoría configurada** — El bot NO enviará la notificación hasta que el streamer establezca una categoría en Twitch.\n\n` +
                            `👁️ ${viewers} espectadores · <t:${startedTs}:R>`,
                        )
                        .setImage(thumbnailWithCache)
                        .setFooter({
                            text: 'OWGalaxy Stream Notifier • Twitch — Esperando categoría',
                            iconURL: 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c1.png',
                        })
                        .setTimestamp(new Date(stream.started_at));
                } else {
                    // En vivo con categoría → se notificaría
                    messagePreview = buildMessagePreview(guildConfig, streamerDoc, streamUrl);

                    embed = new EmbedBuilder()
                        .setColor(0x9146FF)
                        .setAuthor({
                            name: user.display_name,
                            iconURL: user.profile_image_url,
                            url: streamUrl,
                        })
                        .setDescription(`**[${stream.title || 'Sin título'}](${streamUrl})**\n\nPlaying **${stream.game_name}** · 👁️ ${viewers} espectadores · <t:${startedTs}:R>`)
                        .setImage(thumbnailWithCache)
                        .addFields({
                            name: '📨 Mensaje de notificación',
                            value: `\`\`\`\n${messagePreview}\n\`\`\``,
                            inline: false,
                        })
                        .setFooter({
                            text: 'OWGalaxy Stream Notifier • Twitch',
                            iconURL: 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c1.png',
                        })
                        .setTimestamp(new Date(stream.started_at));
                }
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

        // ── KICK ──────────────────────────────────────────────────────────────
        } else {
            const [stream, kickChannel] = await Promise.all([
                getKickStream(username),
                getKickChannel(username),
            ]);

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
                const hasGame = stream.game && stream.game.trim() !== '';

                if (!hasGame) {
                    // En vivo pero sin categoría
                    embed = new EmbedBuilder()
                        .setColor(0xFFAA00)
                        .setAuthor({
                            name: stream.displayName,
                            iconURL: profileImg,
                            url: stream.url,
                        })
                        .setDescription(
                            `**[${stream.title || 'Sin título'}](${stream.url})**\n\n` +
                            `⚠️ **Sin categoría configurada** — El bot NO enviará la notificación hasta que el streamer establezca una categoría en Kick.\n\n` +
                            `👁️ ${viewers} espectadores · <t:${startedTs}:R>`,
                        )
                        .setImage(thumbnail)
                        .setFooter({
                            text: 'OWGalaxy Stream Notifier • Kick — Esperando categoría',
                            iconURL: 'https://kick.com/favicon.ico',
                        })
                        .setTimestamp(new Date(stream.startedAt));
                } else {
                    // En vivo con categoría
                    messagePreview = buildMessagePreview(guildConfig, streamerDoc, stream.url);

                    embed = new EmbedBuilder()
                        .setColor(0x53FC18)
                        .setAuthor({
                            name: stream.displayName,
                            iconURL: profileImg,
                            url: stream.url,
                        })
                        .setDescription(`**[${stream.title || 'Sin título'}](${stream.url})**\n\nPlaying **${stream.game}** · 👁️ ${viewers} espectadores · <t:${startedTs}:R>`)
                        .setImage(thumbnail)
                        .addFields({
                            name: '📨 Mensaje de notificación',
                            value: `\`\`\`\n${messagePreview}\n\`\`\``,
                            inline: false,
                        })
                        .setFooter({
                            text: 'OWGalaxy Stream Notifier • Kick',
                            iconURL: 'https://kick.com/favicon.ico',
                        })
                        .setTimestamp(new Date(stream.startedAt));
                }
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
