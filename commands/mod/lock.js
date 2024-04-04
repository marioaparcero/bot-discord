const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Bloquea el canal para todos los miembros, excepto para los administradores y moderadores.")
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
            [PermissionFlagsBits.SendMessages]: false,
        }, { reason: 'Unlocking the channel' });

        await interaction.reply("Canal bloqueado correctamente.");
    }
}