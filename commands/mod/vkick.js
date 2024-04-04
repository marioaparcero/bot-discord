const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('vkick')
    .setDescription('Expulsa a un usuario por su ID o mencionándolo del voice chat.')
    .addUserOption(option =>
        option.setName('usuario')
        .setDescription('Selecciona al usuario que deseas expulsar.')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('razon')
        .setDescription('Introduce una razón para la expulsión (obligatorio).')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
        ([PermissionFlagsBits.KickMembers, PermissionFlagsBits.ModerateMembers]).bitField
    ),
    async execute(interaction) {
        const usuarioOption = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon');

        const userID = usuarioOption ? usuarioOption.id : usuarioOption;

        try {

            if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return interaction.reply('No tienes permiso para usar este comando.');
            }

            const member = interaction.guild.members.cache.get(userID);
            if (!member.voice.channel) {
                return interaction.reply('El usuario no está en un canal de voz.');
            }
            await member.voice.disconnect(razon);
            await interaction.reply(`El usuario <@${userID}> ha sido expulsado del canal de voz por la razón: ${razon}`);
        } catch (error) {
            if(error.code === 50013) {
                return await interaction.reply('No tienes permisos suficientes para expulsar a este usuario.');
            }
            console.error(error);
            await interaction.reply(`No se pudo expulsar al usuario con ID <@${userID}>.`);
        }
    }
}