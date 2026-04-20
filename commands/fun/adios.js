const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adios')
        .setDescription('Say goodbye in a special format.'),
    async execute(interaction) {
        await interaction.reply(`¡Adiós!`);
        await interaction.followUp('¡Hasta luego!');
    },
};
