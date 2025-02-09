const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adios')
        .setDescription('di adios en un formato especial.'),
    async execute(interaction) {
        await interaction.reply(`¡hasta luego maricon!`);
        await interaction.followUp('¡adios!');
    },
};
