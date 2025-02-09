const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adios')
        .setDescription('Di adiós de forma especial y graciosa.'),
    async execute(interaction) {
        // Respuesta graciosa de despedida
        await interaction.reply(`¡Hasta luego, querido! Que no te atrapen los trolls. 👋😂 (Como diria nuestra mekya original seria ´Hasta luego paquetee´)`);
    },
};
