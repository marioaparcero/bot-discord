const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mutea a un usuario por su ID o mencionándolo.')
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
    .addNumberOption(option =>
        option.setName('tiempo')
        .setDescription('Introduce el tiempo en minutos para el muteo.')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(
        ([PermissionFlagsBits.MuteMembers, PermissionFlagsBits.ModerateMembers]).bitField
    ),
    async execute(interaction) {
        const usuarioOption = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon');
        const tiempo = interaction.options.getNumber('tiempo');
    
        const userID = usuarioOption ? usuarioOption.id : usuarioOption;
    
        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
                return interaction.reply('No tienes permiso para usar este comando.');
            }
    
            const member = interaction.guild.members.cache.get(userID);
    
            // Mute the member in all text channels
           await member.disableCommunicationUntil(Date.now() + (tiempo ? (tiempo * 60 * 1000) : (5 * 60 * 1000)), razon);
    
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