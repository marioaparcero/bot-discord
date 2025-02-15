const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('motivacion')
        .setDescription('Envía un mensaje motivacional.'),
    async execute(interaction) {
        await interaction.reply('¡Tú puedes con todo! 💪');
        await interaction.followUp('Nunca dejes de luchar por tus sueños. 🚀');
    },
};
