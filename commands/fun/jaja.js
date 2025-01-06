const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jaja')
        .setDescription('Say hello in a special format.'),
    async execute(interaction) {
        await interaction.reply(`SR.JAJAS`);
        await interaction.followUp('¿Que tal estás?!');
    },
};
