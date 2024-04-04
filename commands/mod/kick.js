const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario por su ID o mencionándolo.')
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
        ([PermissionFlagsBits.KickMembers]).bitField
    ),
    async execute(interaction) {
        const usuarioOption = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon');

        const userID = usuarioOption ? usuarioOption.id : usuarioOption;

        try {
            await interaction.guild.members.kick(userID, razon);
            await interaction.reply(`El usuario con ID <@${userID}> ha sido expulsado por la razón: ${razon}`);

            const logsChannel = interaction.guild.channels.cache.find(
                (channel) => channel.name === 'logs' && channel.type === 'text'
            );

            if (logsChannel) {
                logsChannel.send(`Usuario expulsado: <@${userID}> por la razón: ${razon}`);
            } else {
                console.error('No se encontró el canal de registro (#logs)');
            }
        } catch (error) {
            console.error(error);
            await interaction.reply(`No se pudo expulsar al usuario con ID ${userID}.`);
        }
    }
}