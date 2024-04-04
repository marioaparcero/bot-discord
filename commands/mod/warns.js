const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require('../../db/database.js');
const { pagination, ButtonTypes, ButtonStyles } = require('@devraelfreeze/discordjs-pagination');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warns")
        .setDescription("Muestra los avisos de un miembro o todo el servidor.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("usuario")
                .setDescription("Muestra los avisos de un miembro.")
                .addUserOption(option =>
                    option
                        .setName("miembro")
                        .setDescription("Miembro del que quieres ver los avisos.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("servidor")
                .setDescription("Muestra los avisos de todo el servidor.")
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

        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "usuario") {
            const member = interaction.options.getMember("miembro");

            db.all(`SELECT * FROM warns WHERE id = ?`, [member.id], (err, rows) => {
                if (err) {
                    return console.error(err.message);
                }
                if (!rows.length) {
                    return interaction.reply("No hay avisos en el servidor.");
                }

                const embeds = [];
                for (let i = 0; i < rows.length; i += 5) {
                    const current = rows.slice(i, i + 5);
                    const embed = new EmbedBuilder()
                        .setTitle('Warnings')
                        .setColor('#0099ff')
                        .addFields(
                            current.map(row => ({
                                name: `ID: ${row.id}`,
                                value: `**Miembro:** <@${row.id}>\n**Razón:** ${row.reason}\n**Fecha:** ${row.timestamp}`
                            })
                            ));
                    embeds.push(embed);
                }

                pagination({
                    embeds,
                    interaction,
                    buttons: [
                        {
                            type: ButtonTypes.previous,
                            label: 'Anterior',
                            style: ButtonStyles.Secondary,
                            emoji: null
                        },
                        {
                            type: ButtonTypes.next,
                            label: 'Siguiente',
                            style: ButtonStyles.Primary,
                            emoji: null
                        }
                    ]
                });
            });
        } else if (subcommand === "servidor") {
            db.all(`SELECT * FROM warns`, (err, rows) => {
                if (err) {
                    return console.error(err.message);
                }
                if (!rows.length) {
                    return interaction.reply("No hay avisos en el servidor.");
                }

                const embeds = [];
                for (let i = 0; i < rows.length; i += 5) {
                    const current = rows.slice(i, i + 5);
                    const embed = new EmbedBuilder()
                        .setTitle('Warnings')
                        .setColor('#0099ff')
                        .addFields(
                            current.map(row => ({
                                name: `ID: ${row.id}`,
                                value: `**Miembro:** <@${row.id}>\n**Razón:** ${row.reason}\n**Fecha:** ${row.timestamp}`
                            })
                            ));
                    embeds.push(embed);
                }

                pagination({
                    embeds,
                    interaction,
                    buttons: [
                        {
                            type: ButtonTypes.previous,
                            label: 'Anterior',
                            style: ButtonStyles.Secondary,
                            emoji: null
                        },
                        {
                            type: ButtonTypes.next,
                            label: 'Siguiente',
                            style: ButtonStyles.Primary,
                            emoji: null
                        }
                    ]
                });
            });
        }
    }
}