const { SlashCommandBuilder } = require('discord.js');

const insultos = [
    "¡Eres como un software sin licencia, no tienes ningún valor!",
    "Tu IQ es más bajo que el nivel de agua de un desierto.",
    "¡Tu cara es tan fea que ni el sol quiere salir cuando te ve!",
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('insulto')
        .setDescription('Te lanza un insulto amistoso y gracioso.'),
    async execute(interaction) {
        const randomInsulto = insultos[Math.floor(Math.random() * insultos.length)];
        await interaction.reply(randomInsulto);
    },
};
