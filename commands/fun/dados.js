const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tirardado')
        .setDescription('Tira un dado con el número de caras que elijas')
        .addIntegerOption(option =>
            option.setName('caras')
                .setDescription('Número de caras del dado (de 1 a 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)), // Limitamos el dado a entre 1 y 100 caras
    async execute(interaction) {
        const caras = interaction.options.getInteger('caras');
        
        // Asegurarse de que el número de caras esté entre 1 y 100
        if (caras < 1 || caras > 100) {
            return interaction.reply('El número de caras debe estar entre 1 y 100.');
        }

        // Lanzar el dado y obtener un resultado aleatorio
        const resultadoDado = Math.floor(Math.random() * caras) + 1;

        await interaction.reply(`Has tirado un dado de **${caras} caras** y el resultado es: **${resultadoDado}**.`);
    },
};
