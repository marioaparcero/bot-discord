const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hola')
        .setDescription('Say hello in a special format.'),
    async execute(interaction) {
        await interaction.reply(`¡Hola!`);
        await interaction.followUp('¿Que tal estás?!');
    },
};
