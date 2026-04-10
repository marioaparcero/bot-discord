/**
 * @author thxmasdev
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Streamer } = require('../../database/models');
const { getTwitchUser, getKickChannel } = require('../../services/streamApi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canal-stream-add')
        .setDescription('Agrega un streamer para recibir notificaciones cuando esté en vivo.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(opt =>
            opt.setName('username')
                .setDescription('Nombre de usuario del streamer')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('plataforma')
                .setDescription('Plataforma de streaming')
                .setRequired(true)
                .addChoices(
                    { name: '🟣 Twitch', value: 'twitch' },
                    { name: '🟢 Kick', value: 'kick' },
                ))
        .addUserOption(opt =>
            opt.setName('discord_user')
                .setDescription('Usuario de Discord del streamer (se mencionará en la notificación)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const username = interaction.options.getString('username').trim().toLowerCase();
        const platform = interaction.options.getString('plataforma');
        const discordUser = interaction.options.getUser('discord_user') || null;
        const guildId = interaction.guildId;

        const { twitchClientId, twitchClientSecret } = require('../../config.json');

        // Verificar vinculación de Discord por plataforma (1 por plataforma por guild)
        if (discordUser) {
            // Buscar si ya está vinculado en la MISMA plataforma
            const linkedSamePlatform = await Streamer.findOne({ guildId, discordUserId: discordUser.id, platform });
            if (linkedSamePlatform) {
                // También ver en qué otras plataformas está vinculado para informar
                const otherPlatform = platform === 'twitch' ? 'kick' : 'twitch';
                const linkedOtherPlatform = await Streamer.findOne({ guildId, discordUserId: discordUser.id, platform: otherPlatform });

                const otherPlatformStatus = linkedOtherPlatform
                    ? `✅ **${otherPlatform.charAt(0).toUpperCase() + otherPlatform.slice(1)}:** Vinculado a **${linkedOtherPlatform.displayName || linkedOtherPlatform.username}**`
                    : `⬜ **${otherPlatform.charAt(0).toUpperCase() + otherPlatform.slice(1)}:** Libre (puedes vincularlo)`;

                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFFAA00)
                            .setTitle('⚠️ Usuario ya vinculado en esta plataforma')
                            .setDescription(
                                `<@${discordUser.id}> ya está vinculado a **${linkedSamePlatform.displayName || linkedSamePlatform.username}** en **${platform.charAt(0).toUpperCase() + platform.slice(1)}**.\n\n` +
                                `Para cambiarlo, elimina primero ese streamer con \`/canal-stream-delete\`.\n\n` +
                                `**Estado de vinculación:**\n` +
                                `❌ **${platform.charAt(0).toUpperCase() + platform.slice(1)}:** Ya vinculado a **${linkedSamePlatform.displayName || linkedSamePlatform.username}**\n` +
                                otherPlatformStatus,
                            )
                            .setFooter({ text: 'Cada usuario de Discord puede vincularse a 1 cuenta por plataforma' }),
                    ],
                });
            }
        }

        // Verificar si ya está registrado
        const existing = await Streamer.findOne({ guildId, username, platform });
        if (existing) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFFAA00)
                        .setTitle('⚠️ Ya registrado')
                        .setDescription(`El streamer **${username}** en **${platform}** ya está registrado en este servidor.`),
                ],
            });
        }

        // Verificar límite máximo
        const count = await Streamer.countDocuments({ guildId });
        if (count >= 25) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF4444)
                        .setTitle('❌ Límite alcanzado')
                        .setDescription('Este servidor ha alcanzado el límite de **25 streamers** monitoreados.'),
                ],
            });
        }

        // Verificar que el streamer existe en la plataforma
        let userId = null;
        let displayName = username;
        let profileImage = null;

        if (platform === 'twitch') {
            const user = await getTwitchUser(username, twitchClientId, twitchClientSecret);
            if (!user) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF4444)
                            .setTitle('❌ Usuario no encontrado')
                            .setDescription(`No se encontró el usuario **${username}** en Twitch. Asegúrate de que el nombre de usuario sea correcto.`),
                    ],
                });
            }
            userId = user.id;
            displayName = user.display_name;
            profileImage = user.profile_image_url;
        } else if (platform === 'kick') {
            const channel = await getKickChannel(username);
            if (!channel) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF4444)
                            .setTitle('❌ Canal no encontrado')
                            .setDescription(`No se encontró el canal **${username}** en Kick. Asegúrate de que el nombre sea correcto.`),
                    ],
                });
            }
            displayName = channel.user?.username || username;
            profileImage = channel.user?.profile_pic || null;
        }

        // Guardar en DB
        await Streamer.create({
            guildId,
            username,
            platform,
            userId,
            displayName,
            profileImage,
            discordUserId: discordUser?.id || null,
            addedBy: interaction.user.id,
        });

        const platformEmoji = platform === 'twitch' ? '🟣' : '🟢';
        const platformColor = platform === 'twitch' ? 0x9146FF : 0x53FC18;
        const discordUserField = discordUser
            ? { name: '🔔 Discord vinculado', value: `<@${discordUser.id}>`, inline: true }
            : { name: '🔔 Discord vinculado', value: 'No vinculado', inline: true };

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(platformColor)
                    .setTitle(`${platformEmoji} Streamer agregado exitosamente`)
                    .setDescription(`Se ha comenzado a monitorear a **${displayName}** en **${platform.charAt(0).toUpperCase() + platform.slice(1)}**.`)
                    .addFields(
                        { name: '👤 Usuario', value: displayName, inline: true },
                        { name: '🌐 Plataforma', value: platform.charAt(0).toUpperCase() + platform.slice(1), inline: true },
                        discordUserField,
                        { name: '🔗 Perfil', value: platform === 'twitch' ? `[Ver canal](https://twitch.tv/${username})` : `[Ver canal](https://kick.com/${username})`, inline: true },
                    )
                    .setThumbnail(profileImage)
                    .setFooter({ text: `Agregado por ${interaction.user.tag}` })
                    .setTimestamp(),
            ],
        });
    },
};
