const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setcolor")
        .setDescription("Cambia el color de un rol.")
        .addRoleOption(option =>
            option.setName("rol")
                .setDescription("Selecciona el rol al que quieras cambiar el color.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("color")
                .setDescription("Introduce el color en formato hexadecimal.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            ([PermissionFlagsBits.ManageRoles]).bitField
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply("No tienes permiso para usar este comando.");
        }
        const rol = interaction.options.getRole("rol");
        const color = interaction.options.getString("color");

        if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
            return interaction.reply(`El color ${color} no es un código hexadecimal válido.`);
        }

        await rol.setColor(color);
        await interaction.reply(`Color de <@&${rol.id}> cambiado a ${color}.`);
    }
}