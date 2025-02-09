const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lanzardado')
        .setDescription('Lanza un dado de 6 caras y muestra el resultado'),
    async execute(interaction) {
        // Generamos un número aleatorio entre 1 y 6
        const resultado = Math.floor(Math.random() * 6) + 1;
        
        // Respondemos con el resultado
        await interaction.reply(`¡El dado ha caído en el número: ${resultado}!`);
    },
};
