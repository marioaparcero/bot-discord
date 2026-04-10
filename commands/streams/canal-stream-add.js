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
                )),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const username = interaction.options.getString('username').trim().toLowerCase();
        const platform = interaction.options.getString('plataforma');
        const guildId = interaction.guildId;

        const { twitchClientId, twitchClientSecret } = require('../../config.json');

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
            addedBy: interaction.user.id,
        });

        const platformEmoji = platform === 'twitch' ? '🟣' : '🟢';
        const platformColor = platform === 'twitch' ? 0x9146FF : 0x53FC18;

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(platformColor)
                    .setTitle(`${platformEmoji} Streamer agregado exitosamente`)
                    .setDescription(`Se ha comenzado a monitorear a **${displayName}** en **${platform.charAt(0).toUpperCase() + platform.slice(1)}**.`)
                    .addFields(
                        { name: '👤 Usuario', value: displayName, inline: true },
                        { name: '🌐 Plataforma', value: platform.charAt(0).toUpperCase() + platform.slice(1), inline: true },
                        { name: '🔗 Perfil', value: platform === 'twitch' ? `[Ver canal](https://twitch.tv/${username})` : `[Ver canal](https://kick.com/${username})`, inline: true },
                    )
                    .setThumbnail(profileImage)
                    .setFooter({ text: `Agregado por ${interaction.user.tag}` })
                    .setTimestamp(),
            ],
        });
    },
};
