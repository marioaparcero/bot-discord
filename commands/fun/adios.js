const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adios')
        .setDescription('Say goodbay in a special format.'),
    async execute(interaction) {
        await interaction.reply(`Adios!`);
        await interaction.followUp('No me mires!');
    },
};
