const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('vmute')
    .setDescription('Mutea a un usuario del canal de voz por su ID o mencionándolo.')
    .addUserOption(option =>
        option.setName('usuario')
        .setDescription('Selecciona al usuario que quieras mutear.')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('razon')
        .setDescription('Introduce la razón del muteo.')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
        ([PermissionFlagsBits.MuteMembers, PermissionFlagsBits.ModerateMembers]).bitField
    ),
    async execute(interaction) {
        const usuarioOption = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon');

        const userID = usuarioOption ? usuarioOption.id : usuarioOption;

        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
                return interaction.reply('No tienes permiso para usar este comando.');
            }

            const member = interaction.guild.members.cache.get(userID);
            await member.voice.setMute(true, razon);
            await interaction.reply(`El usuario <@${userID}> ha sido muteado por la razón: ${razon}`);
        } catch (error) {
            if(error.code === 50013) {
                return await interaction.reply('No tienes permisos suficientes para expulsar a este usuario.');
            }
            console.error(error);
            await interaction.reply(`No se pudo expulsar al usuario con ID <@${userID}>.`);
        }
    }
}