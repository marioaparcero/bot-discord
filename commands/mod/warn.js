const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../db/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Avisa a un miembro.")
        .addUserOption(option =>
            option
                .setName("miembro")
                .setDescription("Miembro al que quieres avisar.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("razón")
                .setDescription("Razón del aviso.")
                .setRequired(true)
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

        const member = interaction.options.getMember("miembro");
        const reason = interaction.options.getString("razón");

        await member.send(`Has sido avisado en **${interaction.guild.name}** por la siguiente razón: ${reason}`);
        await interaction.reply(`El miembro <@${member.id}> ha sido avisado correctamente.`);

        db.run(`INSERT INTO warns (id, user, reason) VALUES (?, ?, ?)`, [member.id, member.user.username, reason], (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log(`A new warn has been added for ${member.user.tag}.`);
        });
    }
}