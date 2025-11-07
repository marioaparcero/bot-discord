const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adios')
        .setDescription('Say hello in a special format.'),
    async execute(interaction) {
        await interaction.reply(`chauu mamahuevo!`);
        await interaction.followUp('morite pete!');
    },
};
