const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('saludo')
        .setDescription('Envía un saludo personalizado con opciones y permite enviar mensajes directos.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario al que deseas enviar un mensaje directo')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('mensaje')
                .setDescription('El mensaje que deseas enviar')
                .setRequired(true)),
    async execute(interaction) {
        const usuario = interaction.options.getUser('usuario');
        const mensaje = interaction.options.getString('mensaje');

        try {
            await usuario.send(mensaje);
            await interaction.reply(`Mensaje enviado exitosamente a ${usuario.tag}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply('No se pudo enviar el mensaje. Asegúrate de que el usuario tenga los mensajes directos habilitados.');
        }
    },
};
