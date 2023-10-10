const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banear')
        .setDescription('Banea a un usuario por su ID o mencionándolo.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Selecciona al usuario que deseas banear (opcional si proporcionas usuarioID).')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Introduce una razón para el ban (obligatorio).')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Obtén el usuario seleccionado o la ID del usuario
        const usuarioOption = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon');

        // Comprueba si se proporcionó una ID de usuario
        const userID = usuarioOption ? usuarioOption.id : usuarioOption;

        try {
            // Verifica si el usuario ya está baneado
            const bans = await interaction.guild.bans.fetch();
            const bannedUser = bans.find(user => user.user.id === userID);

            if (bannedUser) {
                await interaction.reply(`El usuario con ID <@${userID}> ya está baneado.`);
            } else {
                // Intenta ejecutar el comando de ban en el servidor
                await interaction.guild.members.ban(userID, { reason: razon });

                // Envía una respuesta al usuario confirmando el ban
                await interaction.reply(`El usuario con ID <@${userID}> ha sido baneado por la razón: ${razon}`);

                // Obtiene el canal de registro (#logs)
                const logsChannel = interaction.guild.channels.cache.find(
                    (channel) => channel.name === 'logs' && channel.type === 'text'
                );

                // Envía información del baneo al canal de registro
                if (logsChannel) {
                    logsChannel.send(`Usuario baneado: <@${userID}> por la razón: ${razon}`);
                } else {
                    console.error('No se encontró el canal de registro (#logs)');
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.reply(`No se pudo banear al usuario con ID ${userID}.`);
        }
    },
};