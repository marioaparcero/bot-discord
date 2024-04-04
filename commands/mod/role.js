const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Añade o quita un rol a un usuario.")
        .addSubcommand(subcommand =>
            subcommand.setName("add")
                .setDescription("Añade un rol a un usuario.")
                .addUserOption(option =>
                    option.setName("usuario")
                        .setDescription("Selecciona al usuario al que quieras añadir un rol.")
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName("rol")
                        .setDescription("Selecciona el rol que quieras añadir al usuario.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("remove")
                .setDescription("Quita un rol a un usuario.")
                .addUserOption(option =>
                    option.setName("usuario")
                        .setDescription("Selecciona al usuario al que quieras quitar un rol.")
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName("rol")
                        .setDescription("Selecciona el rol que quieras quitar al usuario.")
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(
            ([PermissionFlagsBits.ManageRoles]).bitField
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply("No tienes permiso para usar este comando.");
        }
        const usuarioOption = interaction.options.getUser("usuario");
        const rol = interaction.options.getRole("rol");

        const member = await interaction.guild.members.fetch(usuarioOption.id);

        if (interaction.options.getSubcommand() === "add") {
            await member.roles.add(rol);
            await interaction.reply(`Rol <@&${rol.id}> añadido a <@${usuarioOption.id}>.`);
        } else if (interaction.options.getSubcommand() === "remove") {
            await member.roles.remove(rol);
            await interaction.reply(`Rol <@&${rol.id}> quitado de <@${usuarioOption.id}>.`);
        }
    }
}