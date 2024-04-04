const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Mueve a un usuario a otro canal de voz por su ID o mencionándolo.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Selecciona al usuario que quieras mover.')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Selecciona el canal al que quieras mover al usuario.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice)
        )
        .setDefaultMemberPermissions(
            ([PermissionFlagsBits.MoveMembers, PermissionFlagsBits.ModerateMembers]).bitField
        ),
    async execute(interaction) {
        const usuarioOption = interaction.options.getUser('usuario');
        const channel = interaction.options.getChannel('canal');

        const userID = usuarioOption ? usuarioOption.id : usuarioOption;

        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
                return interaction.reply('No tienes permiso para usar este comando.');
            }

            const member = interaction.guild.members.cache.get(userID);
            await member.voice.setChannel(channel);
            await interaction.reply(`El usuario <@${userID}> ha sido movido al canal ${channel}.`);
        } catch (error) {
            if (error.code === 50013) {
                return await interaction.reply('No tienes permisos suficientes para mover a este usuario.');
            }
            console.error(error);
            await interaction.reply(`No se pudo mover al usuario con ID <@${userID}>.`);
        }
    }
}