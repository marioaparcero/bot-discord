const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Desbloquea el canal para todos los miembros.")
        .setDefaultMemberPermissions(
            (
                [PermissionFlagsBits.Administrator, PermissionFlagsBits.ModerateMembers]
            ).bitField
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) || !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply("No tienes permiso para usar este comando.");
        }
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            [PermissionFlagsBits.SendMessages]: true,
        }, { reason: 'Unlocking the channel' });

        await interaction.reply("Canal desbloqueado correctamente.");
    }
}