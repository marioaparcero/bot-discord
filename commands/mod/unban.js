const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('desbanear')
    .setDescription('Desbanea a un usuario por su ID o mencionándolo.')
    .addStringOption(option =>
        option.setName('usuario')
        .setDescription('Introduce la ID del usuario que deseas desbanear (obligatorio).')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('razon')
        .setDescription('Introduce una razón para el desban (obligatorio).')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
        ([PermissionFlagsBits.BanMembers, PermissionFlagsBits.ModerateMembers]).bitField
    ),
    async execute(interaction) {
        let userId = interaction.options.getString('usuario');
        const razon = interaction.options.getString('razon');

        userId = userId.replace('<@', '').replace('>', '');

        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply('No tienes permiso para usar este comando.');
            }

            const bans = await interaction.guild.bans.fetch();
            const bannedUser = bans.find(user => user.user.id === userId);

            if (!bannedUser) {
                await interaction.reply(`El usuario <@${userId}> no está baneado.`);
            } else {
                await interaction.guild.members.unban(userId, razon);
                await interaction.reply(`El usuario <@${userId}> ha sido desbaneado por la razón: ${razon}`);

                const logsChannel = interaction.guild.channels.cache.find(
                    (channel) => channel.name === 'logs' && channel.type === 'text'
                );

                if (logsChannel) {
                    logsChannel.send(`Usuario desbaneado: <@${userId}> por la razón: ${razon}`);
                } else {
                    console.error('No se encontró el canal de registro (#logs)');
                }
            }
        } catch (error) {
            if(error.code === 50013) {
                return await interaction.reply('No tienes permisos suficientes para desbanear a este usuario.');
            }
            console.error(error);
            await interaction.reply(`No se pudo desbanear al usuario con ID ${userId}.`);
        }
    }
}