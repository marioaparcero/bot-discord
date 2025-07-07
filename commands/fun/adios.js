const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adios')
        .setDescription('Say hello in a special format.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('¡Hola!')
            .setDescription('¿Qué tal estás?')
            .setFooter({ text: 'Comando /adios' });

        await interaction.reply({ embeds: [embed] });
    },
};