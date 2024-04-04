const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../db/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removewarn")
        .setDescription("Remueve avisos de un miembro o de todo el servidor.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("usuario")
                .setDescription("Remueve un aviso de un miembro.")
                .addUserOption(option =>
                    option
                        .setName("miembro")
                        .setDescription("Miembro al que quieres remover los avisos.")
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("servidor")
                .setDescription("Remueve todos los avisos del servidor.")
        )
        .setDefaultMemberPermissions(
            (
                [PermissionFlagsBits.ModerateMembers]
            ).bitField
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply("No tienes permiso para usar este comando.");
        }

        if (interaction.options.getSubcommand() === "servidor") {
            db.run(`DELETE FROM warns`, (err) => {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`All warns have been removed.`);
            })
        }

        if (interaction.options.getSubcommand() === "usuario") {
            const member = interaction.options.getMember("miembro");

            db.run(`DELETE FROM warns WHERE user = ?`, [member.id], (err) => {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`A warn has been removed for ${member.user.tag}.`);
            })
            await interaction.reply(`Los avisos de <@${member.id}> han sido removidos.`);
        }
    }
}