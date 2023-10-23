const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Obtener el ping del bot en un formato especial.'),
    async execute(interaction) {
        const ping = Date.now() - interaction.createdTimestamp;
        await interaction.reply(`🏓 Pong! El ping del bot es ${ping}ms.`);
    },
};
