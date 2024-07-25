const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adios')
        .setDescription('Cya.'),
    async execute(interaction) {
        await interaction.reply(`Adios`);
        await interaction.followUp('achaluego!');
    },
};
