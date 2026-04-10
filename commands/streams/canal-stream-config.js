/**
 * @author thxmasdev
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../database/models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canal-stream-config')
        .setDescription('Muestra la configuración actual de streams del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guildId;
        const config = await GuildConfig.findOne({ guildId });

        const notificationChannel = config?.notificationChannelId
            ? `<#${config.notificationChannelId}>`
            : '❌ No configurado — usa `/canal-stream-id`';

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('⚙️ Configuración de streams')
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .addFields(
                        { name: '📢 Canal de notificaciones', value: notificationChannel, inline: false },
                    )
                    .setFooter({ text: 'Usa /canal-stream-id para cambiar el canal' })
                    .setTimestamp(),
            ],
        });
    },
};
