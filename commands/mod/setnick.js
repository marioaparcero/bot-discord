const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setnick")
        .setDescription("Cambia el apodo de un usuario.")
        .addUserOption(option =>
            option.setName("usuario")
                .setDescription("Selecciona al usuario al que quieras cambiar el apodo.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("apodo")
                .setDescription("Introduce el nuevo apodo.")
                .setRequired(true)
        ).
        setDefaultMemberPermissions(
            ([PermissionFlagsBits.ManageNicknames]).bitField
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.reply("No tienes permiso para usar este comando.");
        }
        const usuarioOption = interaction.options.getUser("usuario");
        const apodo = interaction.options.getString("apodo");

        const member = await interaction.guild.members.fetch(usuarioOption.id);

        await member.setNickname(apodo);
        await interaction.reply(`Apodo de <@${usuarioOption.id}> cambiado a ${apodo}.`);
    }
}