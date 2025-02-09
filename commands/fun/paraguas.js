const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('paraguas')
        .setDescription('Verifica si debes usar un paraguas dependiendo del clima')
        .addStringOption(option => 
            option.setName('clima')
                .setDescription('El clima actual')
                // .setRequired(true) // Hacemos que este parámetro sea obligatorio
        ),

    async execute(interaction) {
        // Obtenemos el valor de la opción 'clima' del comando Slash
        const clima = interaction.options.getString('clima');

        // Verificamos si la opción 'clima' no es nula
        if (clima) {
            // Convertimos el valor del clima a minúsculas para hacer la comparación
            if (clima.toLowerCase() === 'lluvia') {
                await interaction.reply('¡Está lloviendo! ¡No olvides tu paraguas!');
            } else if (clima.toLowerCase() === 'soleado') {
                await interaction.reply('¡El sol está brillando! No hace falta paraguas.');
            } else {
                await interaction.reply('No estoy seguro del clima, pero mejor lleva paraguas por si acaso.');
            }
        } else {
            await interaction.reply('Por favor, proporciona el clima.');
        }
    },
};
