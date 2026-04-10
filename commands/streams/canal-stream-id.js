/**
 * @author thxmasdev
 */
const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../database/models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canal-stream-id')
        .setDescription('Establece el canal de Discord donde se enviarán las notificaciones de streams.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(opt =>
            opt.setName('canal')
                .setDescription('Canal de texto donde se enviarán las notificaciones')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('canal');
        const guildId = interaction.guildId;

        // Verificar permisos del bot en ese canal
        const botMember = interaction.guild.members.me;
        const permissions = channel.permissionsFor(botMember);
        if (!permissions.has(['SendMessages', 'EmbedLinks', 'ViewChannel'])) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF4444)
                        .setTitle('❌ Sin permisos')
                        .setDescription(`No tengo los permisos necesarios en ${channel}.\n\nNecesito:\n• Ver el canal\n• Enviar mensajes\n• Insertar enlaces`),
                ],
            });
        }

        // Upsert la configuración
        await GuildConfig.findOneAndUpdate(
            { guildId },
            { notificationChannelId: channel.id, updatedAt: new Date() },
            { upsert: true, new: true },
        );

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x00FF88)
                    .setTitle('✅ Canal configurado')
                    .setDescription(`Las notificaciones de streams se enviarán en ${channel}.`)
                    .addFields(
                        { name: '📢 Canal', value: `${channel}`, inline: true },
                        { name: '🆔 ID', value: channel.id, inline: true },
                    )
                    .setFooter({ text: `Configurado por ${interaction.user.tag}` })
                    .setTimestamp(),
            ],
        });
    },
};
